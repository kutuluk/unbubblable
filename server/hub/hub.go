package hub

import (
	"log"
	"math"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/connect"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/protocol"
	"github.com/kutuluk/unbubblable/server/terrain"
)

var currID int

func nextID() int {
	currID++
	return currID
}

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
		Terrain:     terrain.NewTerrain(config.MapChunkSize*5, config.MapChunkSize*5, config.MapChunkSize, 3184627059),
	}
}

// Join создает нового игрока, ассоциирцет его с сокетом и добавляет его в список коннектов
func (h *Hub) Join(ws *websocket.Conn) {
	// Создаем игрока
	p := player.NewPlayer(nextID())
	// Создаем коннект
	c := connect.NewConnect(ws, h, p)
	// Добавляем его в список коннектов
	h.connections[c] = true

	//	h.SendUnitInfo(c, p, true)
	h.SendTerrain(c)
}

// Leave закрывает соединение и удаляет его из списка коннектов
func (h *Hub) Leave(c *connect.Connect) {
	delete(h.connections, c)
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

		// Отправляем сообщение всем клиентам
		for d := range h.connections {
			h.SendMovement(d, c.Player)
		}

	}
}

// Handle обрабатывает сообщения
func (h *Hub) Handle(message *protocol.Message, connect *connect.Connect) {

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
			h.Handle(message, connect)
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

	// ChunkRequest
	case protocol.MessageType_MsgUnitInfoRequest:

		// Декодируем сообщение
		msgUnitInfoRequest := new(protocol.UnitInfoRequest)
		err = proto.Unmarshal(message.Body, msgUnitInfoRequest)
		if err != nil {
			log.Println("[proto read]:", err)
			break
		}

		id := int(msgUnitInfoRequest.Id)

		// Ищем нужного игрока и отправляем информацию о нем
		for c := range h.connections {
			if c.Player.ID() == id {
				h.SendUnitInfo(connect, c.Player, connect.Player == c.Player)
				break
			}
		}

		/*
			// Коннект сам себя пингует, этот функционал может потребоваться только при необходимости
			// синхронизации времени

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
					c.SendSystemMessage(0, fmt.Sprintf("Sync: ping %s, offset %s", ping, c.timeOffset))
				}

				c.pingTime = time.Time{}
		*/

	default:
		log.Println("[hub](read): неизвестное сообщение", message.Type)
	}
}
