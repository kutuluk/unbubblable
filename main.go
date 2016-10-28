package main

import (
	"log"
	"net/http"
)

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./public"))))

	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal("Error listening: ", err)
	}
}
