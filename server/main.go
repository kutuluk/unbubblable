package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func ws(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("[upgrade]:", err)
		return
	}
	defer c.Close()
	log.Print("[upgrade]: ok")

	player := NewPlayer()

	go func() {
		for {
			time.Sleep(50 * time.Millisecond)

			player.Tick()

			log.Println(player.Position, player.Angle)

			message, err := json.Marshal(player)
			if err != nil {
				log.Println("[json]:", err)
				break
			}

			//			log.Printf("recv: %s", message)
			err = c.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Println("[write]:", err)
				break
			}
		}
	}()

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("[read]:", err)
			break
		}
		if mt != websocket.TextMessage {
			log.Println("[read]: неподдерживаемый формат сообщения")
			break
		}

		msg, err := ParseMessage(message)
		if err != nil {
			log.Println("[json]:", err)
			break
		}

		msg.Data.Exec(player)
	}
}

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../public"))))
	http.HandleFunc("/status", status)
	http.HandleFunc("/ws", ws)

	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal("Error listening: ", err)
	}
}

func status(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(w, "MyRormg v. 0.1")
}
