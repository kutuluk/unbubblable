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

	startPosition := p.Position
	endPosition := p.Position.Add(p.Motion)

	newMotion := p.Motion
	multiplier := 1.0

	defer func() { p.Motion = mathgl.Vec3{p.Motion.X(), p.Motion.Y(), saveZ} }()

	// Индекс блока ландшафта, с которого юнит начал движение
	i := int(startPosition.X()) + int(startPosition.Y())*h.Terrain.Width

	// Размер ограничивающей сферы
	bound := 0.3

	// Параметризуем прямую, образуемую вектором перемещения
	motionA := -p.Motion.Y()
	motionB := p.Motion.X()
	motionC := -(motionA*startPosition.X() + motionB*startPosition.Y())

	intersection := func(startBound, endBound, dirBound mathgl.Vec3, dir float64) bool {

		// Параметризуем прямую, образуемую границей
		boundA := -dirBound.Y()
		boundB := dirBound.X()
		boundC := -(boundA*startBound.X() + boundB*startBound.Y())

		startMotionOnBound := boundA*startPosition.X() + boundB*startPosition.Y() + boundC
		endMotionOnBound := boundA*endPosition.X() + boundB*endPosition.Y() + boundC

		startBoundOnMotion := motionA*startBound.X() + motionB*startBound.Y() + motionC
		endBoundOnMotion := motionA*endBound.X() + motionB*endBound.Y() + motionC

		// Вектор не пересекает границу, либо пересекает ее на крайних точках, т.е. нет ограничения движения
		if startMotionOnBound*endMotionOnBound > epsilon || startBoundOnMotion*endBoundOnMotion > -epsilon {
			return false
		}

		// Проверка на то, что начальная точка движения находится на границе
		if math.Abs(startMotionOnBound) < epsilon {

			// Если разрешено изменение вектора, вычисляем новый вектор как проекцию на границу
			if redirect {
				p.Motion = dirBound.Normalize().Mul(dir)
				p.Motion = mathgl.Vec3{p.Motion.X(), p.Motion.Y(), saveZ}
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

	z := 0.0

	// Проверка на пересечение при движении налево
	if p.Motion.X() < 0 {

		x := math.Floor(startPosition.X()) + bound

		if startPosition.X() < 1 {

			// левый край
			startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - 1 - bound, z}
			endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 2 + bound, z}
			dirBound := endBound.Sub(startBound)
			if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
				return
			}

		} else {

			// нижний левый
			if startPosition.Y() < 1 || h.Terrain.Map[i-h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - 1 - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}

			// средний левый
			if h.Terrain.Map[i-1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 1 + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}

			// верхний левый
			if startPosition.Y() > float64(h.Terrain.Height-1) || h.Terrain.Map[i+h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 1 - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 2 + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}

		}

	}

	// Проверка на пересечение при движении направо
	if p.Motion.X() > 0 {

		x := math.Floor(startPosition.X()) + 1 - bound

		if startPosition.X() > float64(h.Terrain.Width-1) {

			// правый край
			startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - 1 - bound, z}
			endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 2 + bound, z}
			dirBound := endBound.Sub(startBound)
			if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
				return
			}

		} else {

			// верхний правый
			if startPosition.Y() > float64(h.Terrain.Height-1) || h.Terrain.Map[i+h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 1 - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 2 + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}

			// средний правый
			if h.Terrain.Map[i+1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + 1 + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}

			// нижний правый
			if startPosition.Y() < 1 || h.Terrain.Map[i-h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) - 1 - bound, z}
				endBound := mathgl.Vec3{x, math.Floor(startPosition.Y()) + bound, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.Y()) {
					return
				}
			}
		}
	}

	// Проверка на пересечение при движении вниз
	if p.Motion.Y() < 0 {

		y := math.Floor(startPosition.Y()) + bound

		if startPosition.Y() < 1 {

			// нижний край
			startBound := mathgl.Vec3{math.Floor(startPosition.X()) - 1 - bound, y, z}
			endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 2 + bound, y, z}
			dirBound := endBound.Sub(startBound)
			if intersection(startBound, endBound, dirBound, p.Motion.X()) {
				return
			}

		} else {

			// левый нижний
			if startPosition.X() < 1 || h.Terrain.Map[i-h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) - 1 - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

			// средний нижний
			if h.Terrain.Map[i-h.Terrain.Height].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 1 + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

			// правый нижний
			if startPosition.X() > float64(h.Terrain.Width-1) || h.Terrain.Map[i-h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) + 1 - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 2 + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

		}
	}

	// Проверка на пересечение при движении вверх
	if p.Motion.Y() > 0 {

		y := math.Floor(startPosition.Y()) + 1 - bound

		if startPosition.Y() > float64(h.Terrain.Height-1) {

			// верхний край
			startBound := mathgl.Vec3{math.Floor(startPosition.X()) - 1 - bound, y, z}
			endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 2 + bound, y, z}
			dirBound := endBound.Sub(startBound)
			if intersection(startBound, endBound, dirBound, p.Motion.X()) {
				return
			}

		} else {

			// левый верхний
			if startPosition.X() < 1 || h.Terrain.Map[i+h.Terrain.Height-1].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) - 1 - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

			// средний верхний
			if h.Terrain.Map[i+h.Terrain.Height].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 1 + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

			// правый верхний
			if startPosition.X() > float64(h.Terrain.Width-1) || h.Terrain.Map[i+h.Terrain.Height+1].Block != 0 {
				startBound := mathgl.Vec3{math.Floor(startPosition.X()) + 1 - bound, y, z}
				endBound := mathgl.Vec3{math.Floor(startPosition.X()) + 2 + bound, y, z}
				dirBound := endBound.Sub(startBound)
				if intersection(startBound, endBound, dirBound, p.Motion.X()) {
					return
				}
			}

		}
	}

	p.Motion = newMotion

}
