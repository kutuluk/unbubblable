package main

/*

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Connector struct {
	Connections map[*Connect]bool
}

func (connector *Connector) Join(connect *Connect) {
	connector.Connections[connect] = true
}

func (connector *Connector) Leave(connect *Connect) {
	delete(connector.Connections, connect)
}

type Connect struct {
	WebSocket *websocket.Conn
	Player    *Player
}

func NewConnect(ws *websocket.Conn) *Connect {
	connect := &Connect{
		WebSocket: ws,
		Player:    NewPlayer(),
	}
	go connect.receiver()
	return connect
}

func (connect *Connect) receiver() {
	for {
		mt, message, err := connect.WebSocket.ReadMessage()
		if err != nil {
			log.Println("[ws read]:", err)
			break
		}
		if mt != websocket.TextMessage {
			log.Println("[ws read]: неподдерживаемый формат сообщения")
			break
		}

		msg, err := ParseMessage(message)
		if err != nil {
			log.Println("[proto]:", err)
			break
		}

		msg.Data.Exec(connect.Player)
	}
	connect.WebSocket.Close()
}

func (connect *Connect) ticker() {
	for {
		time.Sleep(50 * time.Millisecond)

		connect.Player.Tick()

		log.Println(connect.Player.Position, connect.Player.Angle)

		message, err := json.Marshal(connect.Player)
		if err != nil {
			log.Println("[json]:", err)
			break
		}

		err = connect.WebSocket.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("[ws write]:", err)
			break
		}
	}
}

*/
