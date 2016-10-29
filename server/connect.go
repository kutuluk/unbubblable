package main

import (
	"log"
	"time"

	"github.com/kutuluk/unbubblable/server/proto"

	"github.com/golang/protobuf/proto"
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
}

// NewHub создает пустой список коннектов
func NewHub() *Hub {
	h := &Hub{
		connections: make(map[*Connect]bool),
		ticker:      time.NewTicker(time.Millisecond * LoopInterval),
	}
	go h.loop()
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
		// Читаем сообщение от клиента
		messageType, messageData, err := c.ws.ReadMessage()
		if err != nil {
			log.Println("[ws read]:", err)
			break
		}

		// Увеличиваем счетчик принятых байт
		c.Received += len(messageData)

		if messageType == websocket.BinaryMessage {
			// Получено бинарное сообщение
			msg := new(protocol.Controller)
			err = proto.Unmarshal(messageData, msg)
			if err != nil {
				log.Println("[proto read]:", err)
				break
			}

			c.Player.Controller = msg
		} else {
			// Получено текстовое сообщение
			msg, err := ParseMessage(messageData)
			if err != nil {
				log.Println("[proto]:", err)
				break
			}

			// Применяем сообщение к игроку
			msg.Data.Exec(c.Player)
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
	message := new(protocol.PlayerPosition)
	message.Position = new(protocol.Vec3)
	message.Position.X = c.Player.Position.X()
	message.Position.Y = c.Player.Position.Y()
	message.Position.Z = c.Player.Position.Z()
	message.Motion = new(protocol.Vec3)
	message.Motion.X = c.Player.Motion.X()
	message.Motion.Y = c.Player.Motion.Y()
	message.Motion.Z = c.Player.Motion.Z()
	message.Angle = c.Player.Angle
	message.Slew = c.Player.Slew

	// Сериализуем протобафом
	msg, err := proto.Marshal(message)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	err = c.ws.WriteMessage(websocket.BinaryMessage, msg)
	if err != nil {
		log.Println("[ws write]:", err)
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(msg)

}
