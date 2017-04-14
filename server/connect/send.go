package connect

import (
	"log"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/protocol"
)

// SenderQueueLength определяет размер очереди сендера
const SenderQueueLength = 10

// sender запускается в виде горутины, накапливает пришедшие из канала сообщения в очереди
// и по мере возможности отправляет их
func (c *Connect) sender() {

	queue := make([][]byte, 0, SenderQueueLength)
	//	var queue [][]byte

	defer func() { log.Println("[connect]: сендер завершился") }()

	for {
		select {
		case message, ok := <-c.send:

			if !ok {
				// Входящий канал закрыт - выход из горутины
				return
			}

			if len(queue) < SenderQueueLength {
				queue = append(queue, message)
			} else {
				log.Println("[connect]: очередь на отправку переполнена")
				//ToDo: тут исходящее сообщение теряется
			}

		default:

			if len(queue) > 0 {

				// Отправляем сообщение
				err := c.ws.WriteMessage(websocket.BinaryMessage, queue[0])
				if err != nil {
					log.Println("[ws write]:", err)
					//ToDo: сделать полноценную обработку ошибки
					if err == websocket.ErrCloseSent {
						// Сокет закрыт - выход из горутины
						return
					}
					// Выход из select и в последующем попытка отправить снова
					break
				}

				// Увеличиваем счетчик отправленных байт
				c.Sent += len(queue[0])

				queue = queue[1:]
			}
		}
	}
}

// SendMessage упаковывает данные в сообщение и отправляет его клиенту
func (c *Connect) SendMessage(msgType protocol.MessageType, msgBody []byte) {

	message := &protocol.Message{
		Type: msgType,
		Body: msgBody,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	c.send <- buffer

}

// SendChain упаковывает данные в цепочку из одного сообщения и отправляет его
func (c *Connect) SendChain(msgType protocol.MessageType, msgBody []byte) {

	// Формируем сообщение
	message := &protocol.Message{
		Type: msgType,
		Body: msgBody,
	}

	// Упаковываем сообщение в цепочку
	//	chain := new(protocol.MessageChain)
	//	chain.Chain = append(chain.Chain, message)
	chain := &protocol.MessageChain{
		Chain: []*protocol.Message{message},
	}

	// Сериализуем сообщение протобафом
	buffer, err := proto.Marshal(chain)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	// Отправляем сообщение
	c.SendMessage(protocol.MessageType_MsgChain, buffer)

}

// SendSystemMessage отправляет клиенту системное сообщение
func (c *Connect) SendSystemMessage(level int, text string) {

	message := &protocol.SystemMessage{
		Level: int32(level),
		Text:  text,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	c.SendMessage(protocol.MessageType_MsgSystemMessage, buffer)

}

// SendPingRequest отправляет клиенту запрос пинга
func (c *Connect) SendPingRequest() {
	// Ничего не делаем, если еще не пришел ответ от прошлого запроса
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

		message := &protocol.PingRequest{}

		buffer, err := proto.Marshal(message)
		if err != nil {
			log.Println("[proto send]:", err)
			return
		}

		// Запоминаем время отправки сообщения
		c.pingTime = time.Now()

		c.SendMessage(protocol.MessageType_MsgPingRequest, buffer)

	}
}

// SendMovement отправляет клиенту позицию персонажа
func (c *Connect) SendMovement() {

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

	c.SendMessage(protocol.MessageType_MsgMovement, buffer)

}

// SendInfo отправляет клиенту служебную информацию
func (c *Connect) SendInfo() {

	message := &protocol.Info{
		Ping: int32(c.pings.median),
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		log.Println("[proto send]:", err)
		return
	}

	c.SendMessage(protocol.MessageType_MsgInfo, buffer)

}

// SendTerrain отправляет клиенту карту
func (c *Connect) SendTerrain() {

	c.SendMessage(protocol.MessageType_MsgTerrain, c.Hub.Terrain.Proto)

}

// SendChunk отправляет клиенту чанк
func (c *Connect) SendChunk(i int) {

	c.SendMessage(protocol.MessageType_MsgChunk, c.Hub.Terrain.Chunks[i].Proto)

}
