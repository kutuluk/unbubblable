package main

import (
	"log"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/kutuluk/unbubblable/server/proto"

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
		Terrain:     NewTerrain(32, 32, 3184627059),
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
	c.sendMap()

	for i := 0; i < c.Hub.Terrain.ChunkedWidth*c.Hub.Terrain.ChunkedHeight; i++ {
		c.sendChunk(i)
	}
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
			//			go c.send(message)
			go c.sendPlayerPosition()

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

		// Преобразуем полученные данные в контейнер
		msgContainer := new(protocol.MessageContainer)
		err = proto.Unmarshal(messageData, msgContainer)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		// Обходим сообщения в контейнере
		for _, message := range msgContainer.Messages {
			switch message.Type {

			// Controller
			case protocol.MessageType_MsgController:

				msgController := new(protocol.Controller)
				// Декодируем сообщение
				err = proto.Unmarshal(message.Body, msgController)
				if err != nil {
					log.Println("[proto read]:", err)
					break
				}
				// Применяем сообщение
				c.Player.Controller = msgController

			default:
				log.Println("[proto read]: не известное сообщение")
			}
		}
	}
	c.Hub.Leave(c)
	log.Println("[connect]: ресивер завершился")
}

// send отправляет сообщение клиенту
func (c *Connect) send(message []byte) {
	err := c.ws.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		log.Println("[ws write]:", err)
	}
}

// sendPlayerPosition отправляет клиенту позицию персонажа
func (c *Connect) sendPlayerPosition() {

	// Формируем сообщение
	msgPlayerPosition := new(protocol.PlayerPosition)
	msgPlayerPosition.Position = new(protocol.Vec3)
	msgPlayerPosition.Position.X = c.Player.Position.X()
	msgPlayerPosition.Position.Y = c.Player.Position.Y()
	msgPlayerPosition.Position.Z = c.Player.Position.Z()
	msgPlayerPosition.Motion = new(protocol.Vec3)
	msgPlayerPosition.Motion.X = c.Player.Motion.X()
	msgPlayerPosition.Motion.Y = c.Player.Motion.Y()
	msgPlayerPosition.Motion.Z = c.Player.Motion.Z()
	msgPlayerPosition.Angle = c.Player.Angle
	msgPlayerPosition.Slew = c.Player.Slew

	// Сериализуем сообщение протобафом
	msgBuffer, err := proto.Marshal(msgPlayerPosition)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Упаковываем сообщение в элемент контейнера
	msgItem := new(protocol.MessageItem)
	msgItem.Type = protocol.MessageType_MsgPlayerPosition
	msgItem.Body = msgBuffer

	// Создаем контейнер и добавляем в него сообщение
	msgContainer := new(protocol.MessageContainer)
	msgContainer.Messages = append(msgContainer.Messages, msgItem)

	// Сериализуем контейнер протобафом
	message, err := proto.Marshal(msgContainer)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	err = c.ws.WriteMessage(websocket.BinaryMessage, message)
	if err != nil {
		log.Println("[ws write]:", err)
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(message)

}

// sendMap отправляет клиенту карту
func (c *Connect) sendMap() {

	// Упаковываем сообщение в элемент контейнера
	msgItem := new(protocol.MessageItem)
	msgItem.Type = protocol.MessageType_MsgTerrain
	msgItem.Body = c.Hub.Terrain.Proto

	// Создаем контейнер и добавляем в него сообщение
	msgContainer := new(protocol.MessageContainer)
	msgContainer.Messages = append(msgContainer.Messages, msgItem)

	// Сериализуем контейнер протобафом
	message, err := proto.Marshal(msgContainer)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	err = c.ws.WriteMessage(websocket.BinaryMessage, message)
	if err != nil {
		log.Println("[ws write]:", err)
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(message)

}

// sendMap отправляет клиенту карту
func (c *Connect) sendChunk(i int) {

	// Упаковываем сообщение в элемент контейнера
	msgItem := new(protocol.MessageItem)
	msgItem.Type = protocol.MessageType_MsgChunk
	msgItem.Body = c.Hub.Terrain.Chunks[i].Proto

	// Создаем контейнер и добавляем в него сообщение
	msgContainer := new(protocol.MessageContainer)
	msgContainer.Messages = append(msgContainer.Messages, msgItem)

	// Сериализуем контейнер протобафом
	message, err := proto.Marshal(msgContainer)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	err = c.ws.WriteMessage(websocket.BinaryMessage, message)
	if err != nil {
		log.Println("[ws write]:", err)
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(message)

}
