package main

import (
	"log"
	"sort"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/kutuluk/unbubblable/server/protocol"

	"math"

	"github.com/gorilla/websocket"
)

// Набор состояний соединения
const (
	StateSYNC = iota
	StateTRANSFER
)

// Hub определяет список коннектов
type Hub struct {
	connections map[*Connect]bool
	// Terrain определяет ландшафт
	Terrain *Terrain
}

// NewHub создает пустой список коннектов
func NewHub() *Hub {
	h := &Hub{
		connections: make(map[*Connect]bool),
		Terrain:     NewTerrain(24*5, 24*5, 24, 3184627059),
	}
	return h
}

// Join создает коннект, добавляет его в список коннектов и
// запускает обработчик входящих сообщений
func (h *Hub) Join(ws *websocket.Conn) {
	// Создаем коннект
	c := &Connect{
		Hub:      h,
		ws:       ws,
		Player:   NewPlayer(),
		bestPing: time.Hour,
		pings:    NewPings(20),
	}

	// Добавляем его в список коннектов
	h.connections[c] = true
	// Запускаем обработчик входящих сообщений
	go c.receiver()
	log.Print("[connect]: новое подключение с адреса ", c.ws.RemoteAddr())
	c.sendTerrain()
}

// Leave закрывает соединение и удаляет его из списка коннектов
func (h *Hub) Leave(c *Connect) {
	log.Print("[connect]: подключение с адреса ", c.ws.RemoteAddr(), " завершено")
	c.ws.Close()
	delete(h.connections, c)
}

// Count возвращает количество коннектов
func (h *Hub) Count() int {
	return len(hub.connections)
}

// Tick определяет обработчик тиков симуляции
func (h *Hub) Tick(tick uint) {

	// Перебираем все соединения
	for c := range h.connections {

		// Осуществляем перерасчет
		c.Player.Update(tick)

		// Отправляем сообщение клиенту
		c.sendMovement()
		//		c.sendPingRequest()
		c.update()
	}
}

type PingInfo []time.Duration

type PingInfos struct {
	pings  PingInfo
	head   int
	median time.Duration
}

func NewPings(l int) PingInfos {
	return PingInfos{
		pings: make(PingInfo, l),
	}
}

func (p *PingInfos) Add(ping time.Duration) {
	p.pings[p.head] = ping
	p.head++
	if p.head == len(p.pings) {
		p.head = 0
	}
}

func (p *PingInfos) CalcMedian() time.Duration {

	s := make(PingInfo, len(p.pings))
	copy(s, p.pings)
	sort.Sort(s)

	l := len(s)
	if l%2 == 0 {
		p.median = (s[l/2+1] - s[l/2-1]) / 2
	} else {
		p.median = s[l/2]
	}

	//	log.Println("[sort pings]:", s)
	log.Println("[median]:", p.median)
	return p.median
}

func (p PingInfo) Len() int { return 20 }

func (p PingInfo) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}

func (p PingInfo) Less(i, j int) bool { return p[i] < p[j] }

// Connect связывает коннект с персонажем
type Connect struct {
	Hub        *Hub
	ws         *websocket.Conn
	Player     *Player
	Received   int
	Sent       int
	Ping       time.Duration
	bestPing   time.Duration
	pingTime   time.Time
	pingToken  int32
	timeOffset time.Duration
	state      int
	frame      int
	pings      PingInfos
}

func (c *Connect) update() {

	switch c.state {

	case StateSYNC:

		c.sendPingRequest()

		if c.frame%20 == 0 {
			c.pings.CalcMedian()
		}

	case StateTRANSFER:

		if c.frame%20 == 0 {
			c.sendPingRequest()
			c.pings.CalcMedian()
		}

	}

	c.frame++

	if c.state == StateSYNC && c.frame%40 == 0 {
		c.state = StateTRANSFER
	}

	if c.frame > LoopAmplitude*60 {
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
		c.Ping = ping

		c.pings.Add(ping)

		if ping < c.bestPing {
			c.bestPing = ping
			timeLocal := c.pingTime.Add(ping / 2).UTC()
			c.timeOffset = timeLocal.Sub(timeRequest)
			log.Println("[time]: ping -", ping, "offset -", c.timeOffset)
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
					c.sendChunk(int(index))
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
			log.Println("[ws read]:", err)
			break
		}

		// Увеличиваем счетчик принятых байт
		c.Received += len(messageData)

		if messageType != websocket.BinaryMessage {
			// Полученное сообщение в текстовом формате
			log.Println("[ws read]: не ожидаемое текстовое сообщение")
			break
		}

		// Декодируем сообщение
		msg := new(protocol.Message)
		err = proto.Unmarshal(messageData, msg)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		// Обрабатываем сообщение
		c.handler(msg)

	}
	c.Hub.Leave(c)
	log.Println("[connect]: ресивер завершился")
}

// sendMessage упаковывает данные в цепочку из одного сообщения и отправляет его
func (c *Connect) sendChain(msgType protocol.MessageType, msgBody []byte) {

	// Формируем сообщение
	message := new(protocol.Message)
	message.Type = msgType
	message.Body = msgBody

	// Упаковываем сообщение в цепочку
	chain := new(protocol.MessageChain)
	chain.Chain = append(chain.Chain, message)

	// Сериализуем сообщение протобафом
	body, err := proto.Marshal(chain)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	c.sendMessage(protocol.MessageType_MsgChain, body)

}

// sendMessage упаковывает данные в сообщение и отправляет его клиенту
func (c *Connect) sendMessage(msgType protocol.MessageType, msgBody []byte) {

	// Формируем сообщение
	msg := new(protocol.Message)
	msg.Type = msgType
	msg.Body = msgBody

	// Сериализуем сообщение протобафом
	message, err := proto.Marshal(msg)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	err = c.ws.WriteMessage(websocket.BinaryMessage, message)
	if err != nil {
		log.Println("[ws write]:", err)
		return
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(message)

}

// sendPingRequest
func (c *Connect) sendPingRequest() {
	if c.pingTime.IsZero() {

		/*
			t := time.Now()
			seconds := t.Unix()
			nanos := int32(t.Sub(time.Unix(seconds, 0)))

			msgTime := &protocol.Timestamp{
				Seconds: seconds,
				Nanos:   nanos,
			}

			msgPingRequest := &protocol.PingRequest{
				Time: msgTime,
				Ping: int32(c.Ping.Nanoseconds() / 1000000),
			}
		*/

		// Формируем сообщение
		msgPingRequest := &protocol.PingRequest{}

		// Сериализуем сообщение протобафом
		msgBuffer, err := proto.Marshal(msgPingRequest)
		if err != nil {
			log.Println("[proto send]:", err)
			return
		}

		c.pingTime = time.Now()

		// Отправляем сообщение
		c.sendMessage(protocol.MessageType_MsgPingRequest, msgBuffer)

	}
}

// sendMovement отправляет клиенту позицию персонажа
func (c *Connect) sendMovement() {

	// Формируем сообщение
	msgMovement := new(protocol.Movement)
	msgMovement.Position = new(protocol.Vec3)
	msgMovement.Position.X = c.Player.Position.X()
	msgMovement.Position.Y = c.Player.Position.Y()
	msgMovement.Position.Z = c.Player.Position.Z()
	msgMovement.Motion = new(protocol.Vec3)
	msgMovement.Motion.X = c.Player.Motion.X()
	msgMovement.Motion.Y = c.Player.Motion.Y()
	msgMovement.Motion.Z = c.Player.Motion.Z()
	msgMovement.Angle = c.Player.Angle
	msgMovement.Slew = c.Player.Slew

	// Сериализуем сообщение протобафом
	msgBuffer, err := proto.Marshal(msgMovement)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	c.sendMessage(protocol.MessageType_MsgMovement, msgBuffer)

}

// sendMap отправляет клиенту карту
func (c *Connect) sendTerrain() {

	// Отправляем сообщение
	c.sendMessage(protocol.MessageType_MsgTerrain, c.Hub.Terrain.Proto)

}

// sendChunk отправляет клиенту чанк по индексу
func (c *Connect) sendChunk(i int) {

	// Отправляем сообщение
	c.sendMessage(protocol.MessageType_MsgChunk, c.Hub.Terrain.Chunks[i].Proto)

}
