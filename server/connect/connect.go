package connect

import (
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"
	"github.com/satori/go.uuid"

	"github.com/kutuluk/unbubblable/server/db"
	"github.com/kutuluk/unbubblable/server/logger"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// Набор состояний соединения
const (
	StateSYNC = iota
	StateTRANSFER
	StateCLOSED
)

// Handler определяет интерфейс обработчика сообщений
type Handler interface {
	Handle(message *protocol.Message, connect *Connect)
	Leave(connect *Connect)
}

// Connect связывает коннект с персонажем
type Connect struct {
	Player   *player.Player
	Received int
	Sent     int
	UUID     uuid.UUID
	SUUID    string
	Logger   *logger.Logger

	handler  Handler
	ws       *websocket.Conn
	outbound chan<- []byte
	state    int
	frame    int
	ping     pingStatistics
	sync     *synchronizer
}

// NewConnect создает коннект
func NewConnect(ws *websocket.Conn, suuid string, h Handler, p *player.Player) *Connect {
	//	p := player.NewPlayer(1)

	/*
		const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
		sid, _ := shortid.New(1, alphabet, 2342)
		suuid, _ := sid.Generate()
	*/
	//suuid, _ := shortid.Generate()
	c := &Connect{
		ws:      ws,
		handler: h,
		Player:  p,
		UUID:    uuid.NewV4(),
		SUUID:   suuid,
		Logger:  logger.New(suuid, "server"),

		// Медиана рассчитывается на основании 4 последних пингов
		ping: newPingStatistics(4),
		sync: NewSynchronizer(),
	}

	// Назначаем обработчик понгов
	c.ws.SetPongHandler(c.pongHandler)
	// Запускаем обработчик входящих сообщений
	c.receiver()
	// Запускаем обработчик исходящих сообщений
	c.outbound = c.sender()

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

func (c *Connect) updateClientOffset() {
	err := db.UpdateSessionOffset(c.SUUID, c.sync.offset)
	if err != nil {
		c.Logger.Error("Не удалось обновить смещение времени:", err)
	}
}

// close закрывает коннект
func (c *Connect) close() {
	c.state = StateCLOSED
	c.handler.Leave(c)
	c.ws.Close()
	close(c.outbound)
	c.updateClientOffset()
	c.Logger.Info("Подключение с адреса", c.ws.RemoteAddr(), "завершено")
	c.Logger.Close()
}

// receiver обрабатывает входящие сообщения
func (c *Connect) receiver() {
	go func() {
		defer func() {
			c.Logger.Info("Ресивер завершился")
			c.close()
		}()

		for {
			// Читаем из сокета
			messageType, messageData, err := c.ws.ReadMessage()
			if err != nil {
				// Завершение ресивера
				c.Logger.Error("Ошибка чтения из сокета:", err)
				break
			}

			now := time.Now()

			// Увеличиваем счетчик принятых байт
			c.Received += len(messageData)

			if messageType != websocket.BinaryMessage {
				c.Logger.Warn("Не ожидаемое входящее текстовое сообщение:", messageData)
				// Игнорируем сообщение
				continue
			}

			// Декодируем сообщение
			message := new(protocol.Message)
			err = proto.Unmarshal(messageData, message)
			if err != nil {
				c.Logger.Error("Ошибка декодирования сообщения:", err)
				// Игнорируем сообщение
				continue
			}

			// Обрабатываем сообщение
			if message.Type == protocol.MessageType_MsgPingResponse {

				c.Logger.Info("Получен ответ синхронизации", now)

				msgPingResponse := new(protocol.PingResponse)
				// Декодируем сообщение
				err = proto.Unmarshal(message.Body, msgPingResponse)
				if err != nil {
					c.Logger.Error("Ошибка декодирования сообщения:", err)
					break
				}

				// Применяем сообщение
				//timeClient := time.Unix(msgPingResponse.Time.Seconds, int64(msgPingResponse.Time.Nanos)).UTC()
				timeClient := time.Unix(msgPingResponse.Time.Seconds, int64(msgPingResponse.Time.Nanos))

				if c.sync.handle(now, timeClient) {
					c.updateClientOffset()
				}

			} else {

				//			c.handle(message)
				// FIXIT: обработка сообщений не должна выполняться в горутине ресивера
				c.handler.Handle(message, c)
			}
		}
	}()
}
