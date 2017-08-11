package connect

import (
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/protocol"
)

// SenderQueueLength определяет размер очереди сендера
const SenderQueueLength = 10

const (
	// Таймаут записи
	writeWait = 1 * time.Second
	// Таймаут чтения
	pongWait = 1 * time.Second
	// Задержка между пингами
	pingPeriod = 250 * time.Millisecond
)

func pingRequest() []byte {
	message := &protocol.PingRequest{}
	buffer, err := proto.Marshal(message)
	if err != nil {
		panic(err)
	}
	return buffer
}

var pingRequestBuffer = pingRequest()

// sender возвращает буферизованный канал и запускает горутину, отправляющую в сеть пришедшие
// в этот канал сообщения. Задача этой горутины - обеспечить запись в сокет из единственного
// конкурентного потока
func (c *Connect) sender() chan<- []byte {
	outbound := make(chan []byte, SenderQueueLength)
	pinger := time.NewTicker(pingPeriod)
	go func() {
		defer func() {
			pinger.Stop()
			//			c.close()
			c.Logger.Info("Сендер завершился")
		}()

		//		for message := range outbound {
		for {

			select {
			case message, ok := <-outbound:
				c.ws.SetWriteDeadline(time.Now().Add(writeWait))
				if !ok {
					// Канал закрыт
					c.ws.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}

				// Отправляем сообщение
				err := c.ws.WriteMessage(websocket.BinaryMessage, message)
				if err != nil {
					c.Logger.Error("Ошибка записи в сокет:", err)

					//ToDo: сделать полноценную обработку ошибки
					if err == websocket.ErrCloseSent {
						// Сокет закрыт - выход из горутины
						// ToDo: нужно ли предпринимать еще какие-то действия, или коннект
						// все равно закроется в ресивере, поскольку соединение закрыто?
						return
					}
					// В этом месте сообщение теряется
					// ToDo: возможно стоит попытаться отправить сообщение снова?
					// ToDo: либо сразу закрывать соединение? Могут ли тут быть не критичные ошибки?
					break
				}
				// Увеличиваем счетчик отправленных байт
				c.Sent += len(message)

			case <-pinger.C:
				c.update()
			}
		}
	}()
	return outbound
}

func (c *Connect) update() {

	c.frame++

	// Отправляем пинг
	if c.ping.start() {
		if err := c.ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
			c.Logger.Error("Не удалось отправить Ping")
			// return
		}
		c.Logger.Debug("Отправлен Ping")
	}

	if c.state == StateSYNC && c.frame%(4*4) == 0 {
		c.state = StateTRANSFER
	}

	// Раз в секунду отправляем служебную информацию
	if c.frame%4 == 0 {
		c.SendInfo()
		//		c.SendSystemMessage(0, fmt.Sprintf("Ping: %v, status: %v", c.ping.median, c.state))

		if c.sync.check() {
			c.sync.begin()
			c.SendPingRequest()
			// FIXIT:
			// c.sync.begin() - если оставить здесь, то этот код может выполниться в момент получения ответа
			// и пинг будет равен 0 - разобраться почему
			c.Logger.Info("Отправлен запрос на синхронизацию")
		}

	}

	if c.frame == 4*4 {
		c.frame = 0
	}

}

// Send сериализует сообщение и отправляет его в исходящий канал
func (c *Connect) Send(msgType protocol.MessageType, msgBody []byte) {

	message := &protocol.Message{
		Type: msgType,
		Body: msgBody,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}

	//	if c.state != StateCLOSED {
	// ToDo: возможна ситуация, когда канал уже закрыт
	// Разобраться, как обрабатывать такую ситуацию
	select {
	case c.outbound <- buffer:
	default:
		// Буфер переполнен - в этом месте сообщение теряется
		c.Logger.Warn("Очередь на отправку переполнена")
	}
	//	}
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
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}

	// Отправляем сообщение
	c.Send(protocol.MessageType_MsgChain, buffer)

}

// SendSystemMessage отправляет клиенту системное сообщение
func (c *Connect) SendSystemMessage(level int, text string) {

	message := &protocol.SystemMessage{
		Level: int32(level),
		Text:  text,
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}

	c.Send(protocol.MessageType_MsgSystemMessage, buffer)

}

// SendInfo отправляет клиенту служебную информацию
func (c *Connect) SendInfo() {

	message := &protocol.Info{
		Ping: int32(c.ping.median),
	}

	buffer, err := proto.Marshal(message)
	if err != nil {
		c.Logger.Error("Ошибка сериализации сообщения:", err)
		return
	}

	c.Send(protocol.MessageType_MsgInfo, buffer)

}

// SendPingRequest отправляет клиенту запрос пинга
func (c *Connect) SendPingRequest() {

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

	/*
		message := &protocol.PingRequest{}

		buffer, err := proto.Marshal(message)
		if err != nil {
			c.Logger.Error("Ошибка сериализации сообщения:", err)
			return
		}

		c.Send(protocol.MessageType_MsgPingRequest, buffer)
	*/

	c.Send(protocol.MessageType_MsgPingRequest, pingRequestBuffer)

	/*
		message := &protocol.Message{
			Type: protocol.MessageType_MsgPingRequest,
			Body: pingRequestBuffer,
		}

		buffer, err := proto.Marshal(message)
		if err != nil {
			c.Logger.Error("Ошибка сериализации сообщения:", err)
			return
		}

		// Отправляем сообщение
		err = c.ws.WriteMessage(websocket.BinaryMessage, buffer)
		if err != nil {
			c.Logger.Error("Ошибка записи в сокет:", err)
			return
		}

		// Увеличиваем счетчик отправленных байт
		c.Sent += len(buffer)
	*/
}
