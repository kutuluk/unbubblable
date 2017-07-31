package hub

import (
	"github.com/golang/protobuf/proto"

	"github.com/kutuluk/unbubblable/server/connect"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// SendMovement отправляет клиенту позицию персонажа
func (h *Hub) SendMovement(c *connect.Connect, u player.Entity) {

	m := u.Movement()
	// Формируем сообщение
	message := &protocol.Movement{
		Id: int32(u.ID()),
		Position: &protocol.Vec3{
			X: m.Position.X(),
			Y: m.Position.Y(),
			Z: m.Position.Z(),
		},
		Motion: &protocol.Vec3{
			X: m.Motion.X(),
			Y: m.Motion.Y(),
			Z: m.Motion.Z(),
		},
		Angle: m.Angle,
		Slew:  m.Slew,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}

	c.Send(protocol.MessageType_MsgMovement, buffer)

}

// SendUnitInfo отправляет клиенту информацию о юните
func (h *Hub) SendUnitInfo(c *connect.Connect, u player.Entity, self bool) {
	message := &protocol.UnitInfo{
		Id:      int32(u.ID()),
		Name:    u.Name(),
		ModelId: 0,
		Self:    self,
	}
	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}
	c.Send(protocol.MessageType_MsgUnitInfo, buffer)
}

// SendConnectInfo отправляет клиенту информацию о юните
func (h *Hub) SendConnectInfo(c *connect.Connect, p player.Entity) {
	u := &protocol.UnitInfo{
		Id:      int32(p.ID()),
		Name:    p.Name(),
		ModelId: 0,
	}

	message := &protocol.ConnectInfo{
		Player: u,
		Uuid:   c.UUID.String(),
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}
	c.Send(protocol.MessageType_MsgConnectInfo, buffer)
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
