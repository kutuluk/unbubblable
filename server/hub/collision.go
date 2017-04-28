package hub

import (
	"math"

	mathgl "github.com/go-gl/mathgl/mgl64"

	"github.com/kutuluk/unbubblable/server/player"
)

const epsilon = 1e-9

// Контроль столкновений со стенами
func (h *Hub) checkCollision(p *player.Player, redirect bool) {

	// Сохраняем Z-компоненту
	saveZ := p.Motion.Z()
	defer func() { p.Motion = mathgl.Vec3{p.Motion.X(), p.Motion.Y(), saveZ} }()

	floorStartX := math.Floor(p.Position.X())
	floorStartY := math.Floor(p.Position.Y())

	endPosition := p.Position.Add(p.Motion)

	newMotion := p.Motion
	multiplier := 1.0

	// Индекс блока ландшафта, с которого юнит начал движение
	i := int(floorStartX) + int(floorStartY)*h.Terrain.Width

	// Размер ограничивающей сферы
	bound := 0.3

	// Параметризуем прямую, образуемую отрезком перемещения
	motionA := -p.Motion.Y()
	motionB := p.Motion.X()
	motionC := -(motionA*p.Position.X() + motionB*p.Position.Y())

	// intersection находит пересечение отрезка движения юнита с границей, заданной
	// точками startBound и endBound и укорачивает вектор движения до точки пересечения.
	// Если начало отрезка движения юнита находится непосредственно на границе и разрешен редирект,
	// то функция направляет вектор перемещения вдоль границы и повторно запускает расчет пересечений.
	// Возвращает true когда движение закончено и больше ни каких вычислений не требуется.
	intersection := func(startBound, endBound mathgl.Vec2, dir float64) bool {

		// Параметризуем прямую, образуемую границей
		dirBound := endBound.Sub(startBound)
		boundA := -dirBound.Y()
		boundB := dirBound.X()
		boundC := -(boundA*startBound.X() + boundB*startBound.Y())

		// Вычисляем расстояние от краев отрезка движения до границы
		startMotionOnBound := boundA*p.Position.X() + boundB*p.Position.Y() + boundC
		endMotionOnBound := boundA*endPosition.X() + boundB*endPosition.Y() + boundC

		// Вычисляем расстояние от краев границы до отрезка движения
		startBoundOnMotion := motionA*startBound.X() + motionB*startBound.Y() + motionC
		endBoundOnMotion := motionA*endBound.X() + motionB*endBound.Y() + motionC

		// Вектор не пересекает границу, либо пересекает ее в крайних точках, т.е. нет ограничения движения
		if startMotionOnBound*endMotionOnBound > epsilon || startBoundOnMotion*endBoundOnMotion > -epsilon {
			return false
		}

		// Проверка на принадлежность границе начальной точки отрезка движения
		if math.Abs(startMotionOnBound) < epsilon {

			// Если разрешено изменение вектора, вычисляем новый вектор как проекцию на границу
			if redirect {
				motion := dirBound.Normalize().Mul(dir)
				p.Motion = mathgl.Vec3{motion.X(), motion.Y(), saveZ}
				// И вызываем проверку пересечений с новым вектором движения
				h.checkCollision(p, false)
				return true
			}

			// Если не разрешено изменение вектора, останавливаем движение
			p.Motion = mathgl.Vec3{0, 0, saveZ}
			return true

		}

		// Вектор пересекает границу -> укорачиваем вектор до пересечения
		u := startMotionOnBound / (startMotionOnBound - endMotionOnBound)
		if multiplier > u {
			newMotion = p.Motion.Mul(u)
			multiplier = u
		}

		return false
	}

	// Проверка на пересечение при движении налево
	if p.Motion.X() < 0 {

		x := floorStartX + bound

		if p.Position.X() < 1 {

			// левый край
			startBound := mathgl.Vec2{x, floorStartY - 1 - bound}
			endBound := mathgl.Vec2{x, floorStartY + 2 + bound}
			if intersection(startBound, endBound, p.Motion.Y()) {
				return
			}

		} else {

			// нижний левый
			if p.Position.Y() < 1 || h.Terrain.Map[i-h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY - 1 - bound}
				endBound := mathgl.Vec2{x, floorStartY + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

			// средний левый
			if h.Terrain.Map[i-1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY - bound}
				endBound := mathgl.Vec2{x, floorStartY + 1 + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

			// верхний левый
			if p.Position.Y() > float64(h.Terrain.Height-1) || h.Terrain.Map[i+h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY + 1 - bound}
				endBound := mathgl.Vec2{x, floorStartY + 2 + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

		}

	}

	// Проверка на пересечение при движении направо
	if p.Motion.X() > 0 {

		x := floorStartX + 1 - bound

		if p.Position.X() > float64(h.Terrain.Width-1) {

			// правый край
			startBound := mathgl.Vec2{x, floorStartY - 1 - bound}
			endBound := mathgl.Vec2{x, floorStartY + 2 + bound}
			if intersection(startBound, endBound, p.Motion.Y()) {
				return
			}

		} else {

			// нижний правый
			if p.Position.Y() < 1 || h.Terrain.Map[i-h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY - 1 - bound}
				endBound := mathgl.Vec2{x, floorStartY + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

			// средний правый
			if h.Terrain.Map[i+1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY - bound}
				endBound := mathgl.Vec2{x, floorStartY + 1 + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

			// верхний правый
			if p.Position.Y() > float64(h.Terrain.Height-1) || h.Terrain.Map[i+h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec2{x, floorStartY + 1 - bound}
				endBound := mathgl.Vec2{x, floorStartY + 2 + bound}
				if intersection(startBound, endBound, p.Motion.Y()) {
					return
				}
			}

		}
	}

	// Проверка на пересечение при движении вниз
	if p.Motion.Y() < 0 {

		y := floorStartY + bound

		if p.Position.Y() < 1 {

			// нижний край
			startBound := mathgl.Vec2{floorStartX - 1 - bound, y}
			endBound := mathgl.Vec2{floorStartX + 2 + bound, y}
			if intersection(startBound, endBound, p.Motion.X()) {
				return
			}

		} else {

			// левый нижний
			if p.Position.X() < 1 || h.Terrain.Map[i-h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec2{floorStartX - 1 - bound, y}
				endBound := mathgl.Vec2{floorStartX + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

			// средний нижний
			if h.Terrain.Map[i-h.Terrain.Height].Block != 0 {
				startBound := mathgl.Vec2{floorStartX - bound, y}
				endBound := mathgl.Vec2{floorStartX + 1 + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

			// правый нижний
			if p.Position.X() > float64(h.Terrain.Width-1) || h.Terrain.Map[i-h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec2{floorStartX + 1 - bound, y}
				endBound := mathgl.Vec2{floorStartX + 2 + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

		}
	}

	// Проверка на пересечение при движении вверх
	if p.Motion.Y() > 0 {

		y := floorStartY + 1 - bound

		//		if floorStartY > float64(h.Terrain.Height-1) {
		if p.Position.Y() > float64(h.Terrain.Height-1) {

			// верхний край
			startBound := mathgl.Vec2{floorStartX - 1 - bound, y}
			endBound := mathgl.Vec2{floorStartX + 2 + bound, y}
			if intersection(startBound, endBound, p.Motion.X()) {
				return
			}

		} else {

			// левый верхний
			if p.Position.X() < 1 || h.Terrain.Map[i+h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec2{floorStartX - 1 - bound, y}
				endBound := mathgl.Vec2{floorStartX + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

			// средний верхний
			if h.Terrain.Map[i+h.Terrain.Height].Block != 0 {
				startBound := mathgl.Vec2{floorStartX - bound, y}
				endBound := mathgl.Vec2{floorStartX + 1 + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

			// правый верхний
			if p.Position.X() > float64(h.Terrain.Width-1) || h.Terrain.Map[i+h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec2{floorStartX + 1 - bound, y}
				endBound := mathgl.Vec2{floorStartX + 2 + bound, y}
				if intersection(startBound, endBound, p.Motion.X()) {
					return
				}
			}

		}
	}

	p.Motion = newMotion

}
