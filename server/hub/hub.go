package hub

import (
	"log"
	"math"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/connect"
	"github.com/kutuluk/unbubblable/server/protocol"
	"github.com/kutuluk/unbubblable/server/terrain"
)

// Hub определяет игровой мир
type Hub struct {
	connections map[*connect.Connect]bool
	// Terrain определяет ландшафт
	Terrain *terrain.Terrain
}

// NewHub создает пустой список коннектов
func NewHub() *Hub {
	return &Hub{
		connections: make(map[*connect.Connect]bool),
		//		players:     make(map[*player.Player]struct{}),
		Terrain: terrain.NewTerrain(config.MapChunkSize*5, config.MapChunkSize*5, config.MapChunkSize, 3184627059),
	}
}

// Join создает коннект, добавляет его в список коннектов и
// запускает обработчик входящих сообщений
func (h *Hub) Join(ws *websocket.Conn) {
	// Создаем коннект
	c := connect.NewConnect(h, ws)
	// Добавляем его в список коннектов
	h.connections[c] = true

	//	c.SendTerrain()
	h.SendTerrain(c)
}

// Leave закрывает соединение и удаляет его из списка коннектов
func (h *Hub) Leave(c *connect.Connect) {
	delete(h.connections, c)
	//	delete(h.players, c.Player)
}

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
		//		c.SendMovement()
		h.SendMovement(c)
		c.Update()
	}
}

// Handle обрабатывает сообщения
func (h *Hub) Handle(message *protocol.Message, connect *connect.Connect) {

	var err error

	switch message.Type {

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
		connect.Player.ControllerQueue.Push(msgController)

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
			if (index >= 0) && (int(index) < h.Terrain.ChunkedWidth*h.Terrain.ChunkedHeight) {
				cx, cy := h.Terrain.GetChankCoord(int(index))
				px := math.Floor(connect.Player.Position.X() / float64(h.Terrain.ChunkSize))
				py := math.Floor(connect.Player.Position.Y() / float64(h.Terrain.ChunkSize))
				dx := math.Abs(px - float64(cx))
				dy := math.Abs(py - float64(cy))
				// Проверяем смежность запрашиваемого чанка с координатами персонажа
				if (dx <= 1) && (dy <= 1) {
					h.SendChunk(connect, int(index))
				}
			}
		}

	default:
		log.Println("[proto read]: не известное сообщение")
	}
}
