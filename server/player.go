package main

import (
	"math"

	"github.com/kutuluk/unbubblable/server/proto"

	mathgl "github.com/go-gl/mathgl/mgl64"
)

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
	//	Controller []MessageController
	Controller *protocol.Controller
}

// NewPlayer инициализирует нового игрока
func NewPlayer() *Player {
	return &Player{
		Speed:    10.0,
		Position: mathgl.Vec3{0, 0, 0.5},
		//		Controller: make([]MessageController, 20),
	}
}

// Update пересчитывает параметры игрока в каждом тике
func (p *Player) Update() {
	// Изменяем параметры игрока в соответствии с приращениями прошлого тика
	p.Position = p.Position.Add(p.Motion)
	p.Angle += p.Slew

	// Обнуляем приращения
	p.Motion = mathgl.Vec3{0, 0, 0}
	p.Slew = 0

	//	if len(p.Controller) > 0 {
	//		controller := p.Controller[0]
	controller := p.Controller

	if controller != nil {
		p.Controller = nil

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
		//		if controller.Modifiers.Shift {
		if controller.Mods.Shift {
			p.Motion = p.Motion.Mul(0.25)
			p.Slew *= 0.25
		}
	}
	//		p.Controller = p.Controller[1:]
	//	}
}
