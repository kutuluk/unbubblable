package connect

import (
	"fmt"
	"log"
	"math"
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

// Connect связывает коннект с персонажем
type Connect struct {
	Hub   *Hub
	ws    *websocket.Conn
	send  chan []byte
	state int
	frame int

	Player   *player.Player
	Received int
	Sent     int

	pings     PingInfo
	pingTime  time.Time
	pingToken int32

	bestPing   time.Duration
	timeOffset time.Duration
}

func (c *Connect) update() {

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
		c.SendSystemMessage(0, fmt.Sprintf("Ping: %v, status: %v", c.pings.median, c.state))
	}

	// 4 раза в секунду отправляем запрос на пинг
	if c.frame%(config.LoopFrequency/4) == 0 {
		c.SendPingRequest()
	}

	if c.frame == config.LoopFrequency*8 {
		c.frame = 0
	}
}

func (c *Connect) handler(message *protocol.Message) {

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
			c.handler(message)
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

		c.pings.add(ping)

		if ping < c.bestPing {
			c.bestPing = ping
			timeLocal := c.pingTime.Add(ping / 2).UTC()
			c.timeOffset = timeLocal.Sub(timeRequest)
			c.SendSystemMessage(0, fmt.Sprintf("Sync: ping %v, offset %v", ping, c.timeOffset))
		}

		c.pingTime = time.Time{}

	// Controller
	case protocol.MessageType_MsgController:

		msgController := new(protocol.ApplyControllerMessage)
		// Декодируем сообщение
		err = proto.Unmarshal(message.Body, msgController)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}
		// Применяем сообщение
		//c.Player.Controller = msgController
		c.Player.ControllerQueue.Push(msgController)

	// ChunkRequest
	case protocol.MessageType_MsgChunkRequest:

		msgChunksRequest := new(protocol.GetChunksRequest)
		// Декодируем сообщение
		err = proto.Unmarshal(message.Body, msgChunksRequest)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		// Применяем сообщение

		// Обходим все запрашиваемые индексы чанков
		for _, index := range msgChunksRequest.Chunks {

			// Проверяем на соответсвие диапазону
			if (index >= 0) && (int(index) < c.Hub.Terrain.ChunkedWidth*c.Hub.Terrain.ChunkedHeight) {
				cx, cy := c.Hub.Terrain.GetChankCoord(int(index))
				px := math.Floor(c.Player.Position.X() / float64(c.Hub.Terrain.ChunkSize))
				py := math.Floor(c.Player.Position.Y() / float64(c.Hub.Terrain.ChunkSize))
				dx := math.Abs(px - float64(cx))
				dy := math.Abs(py - float64(cy))
				// Проверяем смежность запрашиваемого чанка с координатами персонажа
				if (dx <= 1) && (dy <= 1) {
					c.SendChunk(int(index))
				}
			}
		}

	default:
		log.Println("[proto read]: не известное сообщение")
	}
}

// receiver обрабатывает входящие сообщения
func (c *Connect) receiver() {
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
		c.handler(msg)

	}
	c.Hub.Leave(c)
	log.Println("[connect]: ресивер завершился")
}
