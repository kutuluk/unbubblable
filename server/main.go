package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/hub"
	"github.com/kutuluk/unbubblable/server/loop"
)

var upgrader = websocket.Upgrader{}
var h = hub.NewHub()
var l = loop.NewLoop(config.LoopFrequency, h)

// Информационная страница о статусе сервера
func status(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(w, "Unbubblable v. 0.7")
	fmt.Fprintln(w, "Коннектов: ", h.Count())
}

// Обработчик запросов на соединения по протоколу Websocket
func ws(w http.ResponseWriter, r *http.Request) {
	// Создаем соединение
	connect, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("[upgrade]:", err)
		return
	}
	// Добавляем соединение в хаб коннектов
	h.Join(connect)
}

func main() {
	// Определяем обработчики
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../public"))))
	http.HandleFunc("/status", status)
	http.HandleFunc("/ws", ws)

	// Запускаем http-сервер
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("[http]:", err)
	}
}
