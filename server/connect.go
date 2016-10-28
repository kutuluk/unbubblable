package main

import (
	"encoding/json"
	"log"
	"time"

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
	ticker      *time.Ticker
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
		// Перебираем все соединения
		for c := range h.connections {

			// Осуществляем перерасчет
			c.Player.Tick()

			// Тупо сериализуем игрока в JSON
			message, err := json.Marshal(c.Player)
			if err != nil {
				log.Println("[json]:", err)
				break
			}

			// Отправляем сообщение клиенту
			go c.send(message)
		}
	}

	// Останавливаем тикер (по идее программа ни когда не должна исполнить этот код)
	h.ticker.Stop() // вызов не закрывает канал
	log.Println("[hub]: луп завершился")
}

// Connect связывает коннект с персонажем
type Connect struct {
	Hub    *Hub
	ws     *websocket.Conn
	Player *Player
}

// receiver обрабатывает входящие сообщения
func (c *Connect) receiver() {
	for {
		// Читаем сообщение от клиента
		mt, message, err := c.ws.ReadMessage()
		if err != nil {
			log.Println("[ws read]:", err)
			break
		}
		if mt != websocket.TextMessage {
			log.Println("[ws read]: неподдерживаемый формат сообщения")
			break
		}

		// Парсим полученное сообщение
		msg, err := ParseMessage(message)
		if err != nil {
			log.Println("[proto]:", err)
			break
		}

		// Применяем сообщение к игроку
		msg.Data.Exec(c.Player)
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
