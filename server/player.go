package main

import (
	"log"
	"math"

	"github.com/kutuluk/unbubblable/server/protocol"

	mathgl "github.com/go-gl/mathgl/mgl64"
)

type ControllerQueue []*protocol.ApplyControllerMessage

func (q *ControllerQueue) Push(n *protocol.ApplyControllerMessage) {
	if q.Len() < 1 {
		*q = append(*q, n)
	} else {
		log.Println("[player]: сообщение контроллера не уместилось в очередь")
	}
}

func (q *ControllerQueue) Pop() (n *protocol.ApplyControllerMessage) {
	if q.Len() > 0 {
		n = (*q)[0]
		*q = (*q)[1:]
		return
	}
	return nil
}

func (q *ControllerQueue) Len() int {
	return len(*q)
}

// Player определяет игрока
type Player struct {
	// Speed определяет скорость движеия и поворота игрока.
	// Скорость движения в тайлах в секунду равно этому значение.
	// Скорость поворота в радианах в секунду получается при деленни на PI*2 - ???
	Speed float64
	// Position определяет положение игрока
	Position mathgl.Vec3
	// Motion определяет движение игрока
	Motion mathgl.Vec3
	// Angle определяет направление игрока (угол между положительным направленим оси Y и направлением игрока по часовой стрелке)
	Angle float64
	// Slew определяет поворот игрока
	Slew float64

	// Controller определяет слайс состояний контроллера игрока
	//	Controller *protocol.ApplyControllerMessage
	ControllerQueue ControllerQueue
}

// NewPlayer инициализирует нового игрока
func NewPlayer() *Player {
	return &Player{
		Speed:           10.0,
		Position:        mathgl.Vec3{0, 0, 0.01},
		ControllerQueue: make(ControllerQueue, 10),
	}
}

// Update пересчитывает параметры игрока в каждом тике
// FixMe: tick используется для дебага
func (p *Player) Update(tick uint) {
	// Изменяем параметры игрока в соответствии с приращениями прошлого тика
	p.Position = p.Position.Add(p.Motion)
	p.Angle += p.Slew

	// Обнуляем приращения
	p.Motion = mathgl.Vec3{0, 0, 0}
	p.Slew = 0

	//	controller := p.Controller
	controller := p.ControllerQueue.Pop()

	if controller != nil {
		//		p.Controller = nil

		// Формируем величину поворота
		if controller.RotateLeft {
			p.Slew += p.Speed / (math.Pi * 2) / LoopAmplitude
		}

		if controller.RotateRight {
			p.Slew -= p.Speed / (math.Pi * 2) / LoopAmplitude
		}

		// Рассчитываем единичный вектор движения прямо
		forwardDirection := mathgl.QuatRotate(p.Angle, mathgl.Vec3{0, 0, 1}).Rotate(mathgl.Vec3{0, 1, 0})

		// Расчитываем единичный вектор стрейфа направо
		rightDirection := mathgl.QuatRotate(math.Pi/2, mathgl.Vec3{0, 0, -1}).Rotate(forwardDirection)

		// Формируем вектор движения
		if controller.MoveRight {
			p.Motion = p.Motion.Add(rightDirection)
		}

		if controller.MoveLeft {
			p.Motion = p.Motion.Sub(rightDirection)
		}

		if controller.MoveForward {
			p.Motion = p.Motion.Add(forwardDirection)
		}

		if controller.MoveBackward {
			p.Motion = p.Motion.Sub(forwardDirection)
		}

		if p.Motion.Len() > 0 {
			p.Motion = p.Motion.Normalize()
		}
		p.Motion = p.Motion.Mul(p.Speed / LoopAmplitude)

		// Уменьшаем приращения в 4 раза при нажатом шифте
		if controller.Mods.Shift {
			p.Motion = p.Motion.Mul(0.25)
			p.Slew *= 0.25
		}
	} else {
		log.Println("[player]:", tick, "- не получено сообщение контроллера")
	}
}
