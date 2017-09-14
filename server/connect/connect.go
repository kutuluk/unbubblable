package connect

import (
	"context"
	"sync"
	"sync/atomic"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/db"
	"github.com/kutuluk/unbubblable/server/logger"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// Набор состояний соединения
const (
	StateSYNC int32 = iota
	StateOPEN
	StateCLOSED
)

// Handler определяет интерфейс обработчика сообщений
type Handler interface {
	Handle(message *protocol.Message, connect *Connect)
	Leave(connect *Connect)
}

// Connect определяет структуру коннекта
type Connect struct {
	Player *player.Player
	SUUID  string
	Logger *logger.Logger

	handler      Handler
	ws           *websocket.Conn
	outbound     chan<- []byte
	cancelSender context.CancelFunc
	wg           sync.WaitGroup

	state int32
	frame int
	ping  pingStatistics
	sync  *synchronizer

	// Статистика
	Received int
	Sent     int
}

// NewConnect привязывает WebSocket-коннект с персонажем и запускает две горутины
// для отправки и получения сообщений
func NewConnect(ws *websocket.Conn, suuid string, h Handler, p *player.Player) *Connect {
	c := &Connect{
		ws:      ws,
		handler: h,
		Player:  p,
		SUUID:   suuid,
		Logger:  logger.New(suuid, "server"),

		sync: NewSynchronizer(),
		// Медиана рассчитывается на основании 4 последних пингов
		ping: newPingStatistics(4),
	}

	// Назначаем обработчик понгов
	c.ws.SetPongHandler(c.pongHandler)

	// Запускаем обработчик входящих сообщений
	go c.receiver()

	// Создаем контекст для прерывания обработчика исходящих сообщений
	var ctx context.Context
	ctx, c.cancelSender = context.WithCancel(context.Background())
	// Создаем канал исходящих сообщений
	ch := make(chan []byte, SenderQueueLength)
	c.outbound = (chan<- []byte)(ch)
	// Запускаем обработчик исходящих сообщений
	go c.sender(ctx, ch)

	c.wg.Add(2)

	c.Logger.Info("Соединение для сессии", suuid, "с адреса", c.ws.RemoteAddr(), "успешно установлено")

	return c
}

func (c *Connect) pongHandler(string) error {
	// Вычисляем пинг
	now := time.Now()
	c.ping.done(now)
	// Продляем ReadDeadline сокета
	// FIXME Надо ли? Пока убрал таймаут на чтение
	// c.ws.SetReadDeadline(now.Add(pongWait))
	c.Logger.Debug("Получен Pong")
	return nil
}

// Ping возвращает средний пинг
func (c *Connect) Ping() time.Duration {
	return c.ping.median
}

// close закрывает коннект
func (c *Connect) close() {
	oldState := atomic.SwapInt32(&c.state, StateCLOSED)
	if oldState != StateCLOSED {
		c.handler.Leave(c)

		// TODO: Сендер благополучно завершается по ошибке при закрытии сокета
		// Возможно имеет смысл вообще обойтись без контекста и позволить
		// сендеру, как и ресиверу, выходить при ошибке?
		c.cancelSender()

		c.ws.Close()

		c.wg.Wait()

		err := db.SaveSession(c.SUUID, c.sync.offset, c.Received, c.Sent)
		if err != nil {
			c.Logger.Error("Не удалось записать информацию о коннекте:", err)
		}

		c.Logger.Info("Подключение с адреса", c.ws.RemoteAddr(), "завершено")
	}
}

// receiver запускается в виде горутины, вычитывает из сокета входящие сообщения и обрабатывает их.
// Горутина завершается при ошибке чтения из сокета и закрывает коннект. Задача этой горутины - обеспечить
// чтение из сокета из единственного конкурентного потока
// TODO: обработку сообщений нужно вынести из этой горутины
func (c *Connect) receiver() {
	defer func() {
		c.Logger.Debug("Ресивер завершен")
		c.wg.Done()
		c.close()
	}()

	for {
		// Читаем из сокета
		messageType, messageData, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway) {
				c.Logger.Info("Соединение закрыто")
			} else {
				c.Logger.Error("Ошибка чтения из сокета:", err)
			}
			// Завершение ресивера
			return
		}

		now := time.Now()

		// Увеличиваем счетчик принятых байт
		c.Received += len(messageData)

		if messageType != websocket.BinaryMessage {
			c.Logger.Warn("Не ожидаемое входящее текстовое сообщение:", messageData)
			// Игнорируем сообщение
			continue
		}

		message := new(protocol.Message)
		err = proto.Unmarshal(messageData, message)
		if err != nil {
			c.Logger.Warn("Ошибка декодирования сообщения:", err)
			// Игнорируем сообщение
			continue
		}

		if c.handle(message, now) {
			c.handler.Handle(message, c)
		}
	}
}

func (c *Connect) handle(message *protocol.Message, now time.Time) bool {
	// Если получен ответ на пинг, то обрабатываем его
	if message.Type == protocol.MessageType_MsgPingResponse {

		c.Logger.Info("Получен ответ синхронизации", now)

		msgPingResponse := new(protocol.PingResponse)
		err := proto.Unmarshal(message.Body, msgPingResponse)
		if err != nil {
			c.Logger.Warn("Ошибка декодирования сообщения:", err)
			// Игнорируем сообщение
			return false
		}

		// Применяем сообщение
		//timeClient := time.Unix(msgPingResponse.Time.Seconds, int64(msgPingResponse.Time.Nanos)).UTC()
		timeClient := time.Unix(msgPingResponse.Time.Seconds, int64(msgPingResponse.Time.Nanos))

		if c.sync.handle(now, timeClient) {
			// Синхронизация завершена - обновляем базу
			err := db.UpdateSessionOffset(c.SUUID, c.sync.offset)
			if err != nil {
				c.Logger.Error("Не удалось обновить смещение времени:", err)
			}
		}

		return false
	}

	return true
}
