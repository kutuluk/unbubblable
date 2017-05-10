package player

import (
	"log"
	"math"
	"strconv"

	mathgl "github.com/go-gl/mathgl/mgl64"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/protocol"
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

type Movement struct {
	// Position определяет положение юнита
	Position mathgl.Vec3
	// Motion определяет движение юнита
	Motion mathgl.Vec3
	// Angle определяет направление юнита (угол между положительным направленим оси Y и направлением юнита по часовой стрелке)
	Angle float64
	// Slew определяет поворот юнита
	Slew float64
}

// Entity определяет игровую сущность
type Entity interface {
	ID() int
	Name() string
	Movement() Movement
}

// Unit определяет юнит
type Unit struct {
	id int
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
}

// Movement возвращает движение игрока
func (u Unit) Movement() Movement {
	return Movement{
		Position: u.Position,
		Motion:   u.Motion,
		Angle:    u.Angle,
		Slew:     u.Slew,
	}
}

// ID возвращает идентификатор юнита
func (u Unit) ID() int {
	return u.id
}

// Name возвращает имя юнита
func (u Unit) Name() string {
	return "Unit" + strconv.Itoa(u.id)
}

// Player определяет игрока
type Player struct {
	Unit

	// Controller определяет слайс состояний контроллера игрока
	//	Controller *protocol.ApplyControllerMessage
	ControllerQueue ControllerQueue

	//	instance *world.Instance
}

// Name возвращает имя игрока
func (p Player) Name() string {
	return "Player" + strconv.Itoa(p.id)
}

// NewPlayer инициализирует нового игрока
func NewPlayer(id int) *Player {
	return &Player{
		Unit: Unit{
			id:       id,
			Speed:    7.0,
			Position: mathgl.Vec3{1, 1, 0},
		},
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
			p.Slew += p.Speed / (math.Pi * 2) / config.LoopFrequency
		}

		if controller.RotateRight {
			p.Slew -= p.Speed / (math.Pi * 2) / config.LoopFrequency
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
		p.Motion = p.Motion.Mul(p.Speed / config.LoopFrequency)

		// Уменьшаем приращения в 4 раза при нажатом шифте
		if controller.Mods.Shift {
			p.Motion = p.Motion.Mul(0.25)
			p.Slew *= 0.25
		}
	} else {
		//		log.Println("[player]:", tick, "- не получено сообщение контроллера")
	}
}
