package connect

import (
	"log"
	"time"

	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/terrain"
)

// Hub определяет список коннектов
type Hub struct {
	connections map[*Connect]bool
	// Terrain определяет ландшафт
	Terrain *terrain.Terrain
}

// NewHub создает пустой список коннектов
func NewHub() *Hub {
	return &Hub{
		connections: make(map[*Connect]bool),
		//		players:     make(map[*player.Player]struct{}),
		Terrain: terrain.NewTerrain(config.MapChunkSize*5, config.MapChunkSize*5, config.MapChunkSize, 3184627059),
	}
}

// Join создает коннект, добавляет его в список коннектов и
// запускает обработчик входящих сообщений
func (h *Hub) Join(ws *websocket.Conn) {
	// Создаем коннект
	p := player.NewPlayer()
	c := &Connect{
		Hub:      h,
		ws:       ws,
		Player:   p,
		bestPing: time.Hour,
		// Пинги идут 4 раза в секунду. Медиану быдем рассчитывать раз в секунду, значит
		// интервал устанавливаем равным 4. Медиану рассчитываем на основании последних
		// 5 секунд, значит длину сохраняемых пингов устанавливаем в 4*5=20
		pings: newPings(20, 4),
		send:  make(chan []byte),
	}

	// Добавляем его в список
	//	h.players[p] = struct{}{}
	// Добавляем его в список коннектов
	h.connections[c] = true
	// Запускаем обработчик входящих сообщений
	go c.receiver()
	// Запускаем обработчик исходящих сообщений
	go c.sender()

	log.Print("[connect]: новое подключение с адреса ", c.ws.RemoteAddr())
	c.SendTerrain()
}

// Leave закрывает соединение и удаляет его из списка коннектов
func (h *Hub) Leave(c *Connect) {
	delete(h.connections, c)
	//	delete(h.players, c.Player)
	log.Print("[connect]: подключение с адреса ", c.ws.RemoteAddr(), " завершено")
	c.ws.Close()
	close(c.send)
}

/*
// LeavePlayer закрывает соединение и удаляет его из списка коннектов
func (h *Hub) LeavePlayer(p *Player) {
	delete(h.players, p)
	delete(h.connections, c)
	log.Print("[connect]: подключение с адреса ", c.ws.RemoteAddr(), " завершено")
	c.ws.Close()
	close(c.send)
}
*/

// Count возвращает количество коннектов
func (h *Hub) Count() int {
	return len(h.connections)
}

// Tick определяет обработчик тиков симуляции
func (h *Hub) Tick(tick uint) {

	// Перебираем все соединения
	for c := range h.connections {

		// Осуществляем перерасчет
		c.Player.Update(tick)

		// Отправляем сообщение клиенту
		c.SendMovement()
		c.update()
	}
}
