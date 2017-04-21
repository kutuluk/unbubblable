package connect

import (
	"log"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

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

	handler  Handler
	ws       *websocket.Conn
	outbound chan<- []byte
	state    int
	frame    int
	ping     pingStatistics
}

// NewConnect создает коннект
func NewConnect(ws *websocket.Conn, h Handler, p *player.Player) *Connect {
	//	p := player.NewPlayer(1)
	c := &Connect{
		ws:      ws,
		handler: h,
		Player:  p,
		// Медиана рассчитывается на основании 4 последних пингов
		ping: newPingStatistics(4),
	}

	// Назначаем обработчик понгов
	c.ws.SetPongHandler(c.pongHandler)
	// Запускаем обработчик входящих сообщений
	c.receiver()
	// Запускаем обработчик исходящих сообщений
	c.outbound = c.sender()

	log.Print("[connect]: новое подключение с адреса ", c.ws.RemoteAddr())

	return c
}

func (c *Connect) pongHandler(string) error {
	// Вычисляем пинг
	now := time.Now()
	c.ping.done(now)
	// Продляем Deadline сокета
	c.ws.SetReadDeadline(now.Add(pongWait))
	return nil
}

// Ping возвращает средний пинг
func (c *Connect) Ping() time.Duration {
	return c.ping.median
}

// close закрывает коннект
func (c *Connect) close() {
	c.state = StateCLOSED
	c.handler.Leave(c)
	c.ws.Close()
	close(c.outbound)
	log.Print("[connect]: подключение с адреса ", c.ws.RemoteAddr(), " завершено")
}

// receiver обрабатывает входящие сообщения
func (c *Connect) receiver() {
	go func() {
		defer func() {
			c.close()
			log.Println("[connect]: ресивер завершился")
		}()

		for {
			// Читаем из сокета
			messageType, messageData, err := c.ws.ReadMessage()
			if err != nil {
				// Завершение ресивера
				log.Println("[receiver]:", err)
				break
			}

			// Увеличиваем счетчик принятых байт
			c.Received += len(messageData)

			if messageType != websocket.BinaryMessage {
				log.Println("[receiver]: не ожидаемое текстовое сообщение -", messageData)
				// Игнорируем сообщение
				continue
			}

			// Декодируем сообщение
			message := new(protocol.Message)
			err = proto.Unmarshal(messageData, message)
			if err != nil {
				log.Println("[proto read]:", err)
				// Игнорируем сообщение
				continue
			}

			// Обрабатываем сообщение
			//			c.handle(message)
			c.handler.Handle(message, c)
		}
	}()
}

func (c *Connect) update() {

	c.frame++

	// Отправляем пинг
	if c.ping.start() {
		if err := c.ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
			return
		}
	}

	if c.state == StateSYNC && c.frame%(4*4) == 0 {
		c.state = StateTRANSFER
	}

	// Раз в секунду отправляем служебную информацию
	if c.frame%4 == 0 {
		c.SendInfo()
		//		c.SendSystemMessage(0, fmt.Sprintf("Ping: %v, status: %v", c.ping.median, c.state))
	}

	if c.frame == 4*4 {
		c.frame = 0
	}

}
