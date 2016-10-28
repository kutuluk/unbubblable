package main

import (
	"encoding/json"
	"errors"
)

type MessageHeader struct {
	Time int64  `json:"time"`
	Tick int64  `json:"tick"`
	Type string `json:"type"`
}

type RawMessage struct {
	Header MessageHeader   `json:"header"`
	Data   json.RawMessage `json:"data"`
}

type Messager interface {
	Exec(*Player)
}

type Message struct {
	Header MessageHeader
	Data   Messager
}

type KeyModifiers struct {
	Shift bool `json:"shift"`
	Ctrl  bool `json:"ctrl"`
	Alt   bool `json:"alt"`
	Meta  bool `json:"meta"`
}

type MessageController struct {
	MoveForward  bool         `json:"moveForward"`
	MoveBackward bool         `json:"moveBackward"`
	MoveLeft     bool         `json:"moveLeft"`
	MoveRight    bool         `json:"moveRight"`
	RotateLeft   bool         `json:"rotateLeft"`
	RotateRight  bool         `json:"rotateRight"`
	ZoomIn       bool         `json:"zoomIn"`
	ZoomOut      bool         `json:"zoomOut"`
	Modifiers    KeyModifiers `json:"modifiers"`
}

func (m MessageController) Exec(p *Player) {
	//	p.Controller = append(p.Controller, m)
	p.Controller = m
}

func ParseMessage(Json []byte) (Message, error) {

	var m RawMessage
	err := json.Unmarshal(Json, &m)
	if err != nil {
		return Message{}, err
	}

	var data Messager
	switch m.Header.Type {
	case "controller":
		data = new(MessageController)
	default:
		return Message{}, errors.New("Неизвестный тип сообщения")
	}

	err = json.Unmarshal(m.Data, data)
	if err != nil {
		return Message{}, err
	}

	return Message{m.Header, data}, nil
}
