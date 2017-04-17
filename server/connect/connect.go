package connect

import (
	"fmt"
	"log"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// Набор состояний соединения
const (
	StateSYNC = iota
	StateTRANSFER
)

// Handler определяет интерфейс обработчика сообщений
type Handler interface {
	Handle(message *protocol.Message, connect *Connect)
	Leave(connect *Connect)
}

// Connect связывает коннект с персонажем
type Connect struct {
	handler  Handler
	ws       *websocket.Conn
	outbound chan<- []byte
	state    int
	frame    int

	Player   *player.Player
	Received int
	Sent     int

	statistics pingStatistics
	pingTime   time.Time
	pingToken  int32

	bestPing   time.Duration
	timeOffset time.Duration
}

// NewConnect создает коннект
func NewConnect(h Handler, ws *websocket.Conn) *Connect {
	p := player.NewPlayer()
	c := &Connect{
		handler:  h,
		ws:       ws,
		Player:   p,
		bestPing: time.Hour,
		// Статистика охватывает 4 последних пинга
		statistics: newPingStatistics(4),
	}

	// Запускаем обработчик входящих сообщений
	c.receiver()
	// Запускаем обработчик исходящих сообщений
	c.outbound = c.sender()

	log.Print("[connect]: новое подключение с адреса ", c.ws.RemoteAddr())

	return c
}

// receiver обрабатывает входящие сообщения
func (c *Connect) receiver() {
	go func() {
		for {
			// Читаем данные из сокета
			messageType, messageData, err := c.ws.ReadMessage()
			if err != nil {
				// Завершение ресивера
				log.Println("[ws read]:", err)
				break
			}

			// Увеличиваем счетчик принятых байт
			c.Received += len(messageData)

			if messageType != websocket.BinaryMessage {
				// Полученное сообщение в текстовом формате - игнорируем сообщение
				log.Println("[ws read]: не ожидаемое текстовое сообщение")
				continue
			}

			// Декодируем сообщение
			msg := new(protocol.Message)
			err = proto.Unmarshal(messageData, msg)
			if err != nil {
				// Полученное сообщение не декодировано - игнорируем сообщение
				log.Println("[proto read]:", err)
				continue
			}

			// Обрабатываем сообщение
			c.handle(msg)

		}
		c.handler.Leave(c)
		log.Print("[connect]: подключение с адреса ", c.ws.RemoteAddr(), " завершено")
		c.ws.Close()
		close(c.outbound)

		log.Println("[connect]: ресивер завершился")
	}()
}

// Переделать так, чтобы коннект был самодостаточныи и сам по таймеру вызывал свой апдейт
func (c *Connect) Update() {

	c.frame++

	switch c.state {

	case StateSYNC:

		// Сразу после создания соединения форсируем сбор статистики
		c.SendPingRequest()

	case StateTRANSFER:

		if c.frame%20 == 0 {
			//			c.sendPingRequest()
		}

	}

	if c.state == StateSYNC && c.frame%(config.LoopFrequency*4) == 0 {
		c.state = StateTRANSFER
	}

	// раз в секунду отправляем служебную информацию
	if c.frame%(config.LoopFrequency) == 0 {
		c.SendInfo()
		c.SendSystemMessage(0, fmt.Sprintf("Ping: %v, status: %v", c.statistics.median, c.state))
	}

	// 4 раза в секунду отправляем запрос на пинг
	if c.frame%(config.LoopFrequency/4) == 0 {
		c.SendPingRequest()
	}

	if c.frame == config.LoopFrequency*8 {
		c.frame = 0
	}
}

func (c *Connect) handle(message *protocol.Message) {

	var err error

	switch message.Type {

	// Chain
	case protocol.MessageType_MsgChain:

		// Декодируем сообщение
		msgChain := new(protocol.MessageChain)
		err = proto.Unmarshal(message.Body, msgChain)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		// Обходим все сообщения в цепочке
		for _, message := range msgChain.Chain {
			c.handle(message)
		}

	// PingResponse
	case protocol.MessageType_MsgPingResponse:

		timeNow := time.Now()

		msgPingResponse := new(protocol.PingResponse)
		// Декодируем сообщение
		err = proto.Unmarshal(message.Body, msgPingResponse)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		// Применяем сообщение
		timeRequest := time.Unix(msgPingResponse.Time.Seconds, int64(msgPingResponse.Time.Nanos)).UTC()

		ping := timeNow.Sub(c.pingTime)

		c.statistics.add(ping)

		if ping < c.bestPing {
			c.bestPing = ping
			timeLocal := c.pingTime.Add(ping / 2).UTC()
			c.timeOffset = timeLocal.Sub(timeRequest)
			c.SendSystemMessage(0, fmt.Sprintf("Sync: ping %v, offset %v", ping, c.timeOffset))
		}

		c.pingTime = time.Time{}

	default:
		c.handler.Handle(message, c)
	}
}
