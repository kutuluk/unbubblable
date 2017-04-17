package hub

import (
	"log"

	"github.com/golang/protobuf/proto"

	"github.com/kutuluk/unbubblable/server/connect"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// SendMovement отправляет клиенту позицию персонажа
func (h *Hub) SendMovement(c *connect.Connect) {

	// Формируем сообщение
	message := &protocol.Movement{
		Position: &protocol.Vec3{
			X: c.Player.Position.X(),
			Y: c.Player.Position.Y(),
			Z: c.Player.Position.Z(),
		},
		Motion: &protocol.Vec3{
			X: c.Player.Motion.X(),
			Y: c.Player.Motion.Y(),
			Z: c.Player.Motion.Z(),
		},
		Angle: c.Player.Angle,
		Slew:  c.Player.Slew,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	c.Send(protocol.MessageType_MsgMovement, buffer)

}

// SendTerrain отправляет клиенту карту
func (h *Hub) SendTerrain(c *connect.Connect) {

	c.Send(protocol.MessageType_MsgTerrain, h.Terrain.Proto)

}

// SendChunk отправляет клиенту чанк
func (h *Hub) SendChunk(c *connect.Connect, i int) {

	c.Send(protocol.MessageType_MsgChunk, h.Terrain.Chunks[i].Proto)

}

/*
// SendPingRequest отправляет клиенту запрос пинга
func (c *Connect) SendPingRequest() {
	// Ничего не делаем, если еще не пришел ответ от прошлого запроса
	if c.pingTime.IsZero() {

//			t := time.Now()
//			seconds := t.Unix()
//			nanos := int32(t.Sub(time.Unix(seconds, 0)))
//
//			msgTime := &protocol.Timestamp{
//				Seconds: seconds,
//				Nanos:   nanos,
//			}
//
//			msgPingRequest := &protocol.PingRequest{
//				Time: msgTime,
//				Ping: int32(c.Ping.Nanoseconds() / 1000000),
//			}

		message := &protocol.PingRequest{}

		buffer, err := proto.Marshal(message)
		if err != nil {
			log.Println("[proto send]:", err)
			return
		}

		// Запоминаем время отправки сообщения
		c.pingTime = time.Now()

		c.Send(protocol.MessageType_MsgPingRequest, buffer)

	}
}
*/
