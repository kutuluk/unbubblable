package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

const (
	// LoopFrequency задает частоту тиков симуляции в секунду
	LoopFrequency = 20
)

var upgrader = websocket.Upgrader{}
var hub = NewHub()
var loop = NewLoop(LoopFrequency, hub)

// Информационная страница о статусе сервера
func status(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintln(w, "Unbubblable v. 0.6")
	fmt.Fprintln(w, "Коннектов: ", hub.Count())
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
	hub.Join(connect)
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
