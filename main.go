package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type CharPosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type CharData struct {
	Position CharPosition `json:"position"`
	Angle    float64      `json:"angle"`
}

type Message struct {
	Time int64    `json:"time"`
	Tick int64    `json:"tick"`
	Type string   `json:"type"`
	Data CharData `json:"data"`
}

var upgrader = websocket.Upgrader{}

func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	log.Print("upgrade: ok")
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./public"))))
	http.HandleFunc("/echo", echo)

	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal("Error listening: ", err)
	}
}
