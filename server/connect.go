package main

import (
	"log"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/kutuluk/unbubblable/server/protocol"

	"math"

	"github.com/gorilla/websocket"
)

// Амплитуда и интервал тиков
const (
	LoopAmplitude = 20
	LoopInterval  = 1000 / LoopAmplitude
)

// Hub определяет список коннектов
type Hub struct {
	connections map[*Connect]bool
	// Порядковый номер текущего тика
	Tick int64
	// Время начала текущего тика
	Time   int64
	ticker *time.Ticker
	// Terrain определяет карту
	Terrain *Terrain
}

// NewHub создает пустой список коннектов
func NewHub() *Hub {
	h := &Hub{
		connections: make(map[*Connect]bool),
		ticker:      time.NewTicker(time.Millisecond * LoopInterval),
		Terrain:     NewTerrain(24*5, 24*5, 24, 3184627059),
	}
	go h.loop()
	log.Println("[hub]: луп запустился")
	return h
}

// Join создает коннект, добавляет его в список коннектов и
// запускает обработчик входящих сообщений
func (h *Hub) Join(ws *websocket.Conn) {
	// Создаем коннект
	c := &Connect{
		Hub:    h,
		ws:     ws,
		Player: NewPlayer(),
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

// loop определяет игровой цикл
func (h *Hub) loop() {
	// Ждем следующего тика
	for range h.ticker.C {
		h.Tick++
		h.Time = time.Now().Unix()
		// Перебираем все соединения
		for c := range h.connections {

			// Осуществляем перерасчет
			c.Player.Update()

			// Отправляем сообщение клиенту
			//			go c.sendMovement()
			c.sendMovement()
		}
	}

	// Останавливаем тикер (по идее программа ни когда не должна исполнить этот код)
	h.ticker.Stop() // вызов не закрывает канал
	log.Println("[hub]: луп завершился")
}

// Connect связывает коннект с персонажем
type Connect struct {
	Hub      *Hub
	ws       *websocket.Conn
	Player   *Player
	Received int
	Sent     int
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
		c.Player.Controller = msgController

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
