package connect

import (
	"context"
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

func pingRequestMessage(prb []byte) []byte {
	message := &protocol.Message{
		Type: protocol.MessageType_MsgPingRequest,
		Body: prb,
	}
	buffer, err := proto.Marshal(message)
	if err != nil {
		panic(err)
	}
	return buffer
}

var pingRequestBuffer = pingRequest()
var pingRequestMessageBuffer = pingRequestMessage(pingRequestBuffer)

// sender запускается в виде горутины и отправляет в сокет пришедшие
// в канал сообщения. Попутно с интервалом в pingPeriod отправляет пинги. Задача этой горутины - обеспечить
// запись в сокет из единственного конкурентного потока
func (c *Connect) sender(ctx context.Context, inbound <-chan []byte) {
	pinger := time.NewTicker(pingPeriod)
	defer func() {
		c.wg.Done()
		pinger.Stop()
		c.Logger.Debug("Сендер завершен")
		c.close()
	}()

	for {

		select {
		case <-ctx.Done():
			// TODO: Это сообщение по идее нужно отправлять только когда сервер инициирует закрытие соединения.
			// На всякий случай отправляю всегда. Надо ли?
			// c.ws.WriteControl(websocket.CloseMessage, []byte{}, time.Now().Add(writeWait))
			//c.ws.WriteMessage(websocket.CloseMessage, []byte{})
			return

		case message := <-inbound:
			// Отправляем сообщение
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))
			err := c.ws.WriteMessage(websocket.BinaryMessage, message)
			if err != nil {
				c.Logger.Error("Ошибка записи в сокет:", err)
				// TODO: В этом месте сендер завершается
				// Могут ли тут быть не критичные ошибки?
				// Возможно стоит попытаться отправить сообщение снова?
				// Пока не отловил ни одной такой ошибки, нужно собрать статистику по ним.
				return
			}

			// Увеличиваем счетчик отправленных байт
			c.Sent += len(message)

		case <-pinger.C:
			c.update()
		}
	}
}

func (c *Connect) update() {

	c.frame++

	// Отправляем пинг
	if c.ping.start() {
		//if err := c.ws.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
		if err := c.ws.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(writeWait)); err != nil {
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
			b := time.Now()
			c.sync.begin()
			c.SendPingRequest()
			// FIXME:
			// c.sync.begin() - если оставить здесь, то этот код может выполниться в момент получения ответа
			// и пинг будет равен 0 - разобраться почему
			c.Logger.Info("Отправлен запрос на синхронизацию", b)
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

	select {
	case c.outbound <- buffer:
	default:
		// Буфер переполнен - в этом месте сообщение теряется
		c.Logger.Warn("Очередь на отправку переполнена")
	}
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

	//c.Send(protocol.MessageType_MsgPingRequest, pingRequestBuffer)

	// Отправляем сообщение без очереди
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	err := c.ws.WriteMessage(websocket.BinaryMessage, pingRequestMessageBuffer)
	if err != nil {
		c.Logger.Error("Ошибка записи в сокет:", err)
		return
	}

	// Увеличиваем счетчик отправленных байт
	c.Sent += len(pingRequestMessageBuffer)
}
