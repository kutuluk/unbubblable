package main

import (
	"log"
	"time"
)

// Ticker определяет интерфейс обработчика тиков
type Ticker interface {
	Tick(uint)
}

// Loop определяет цикл, старающийся "тикать" через равные промежутки времени
// и корректирующий момент следующего тика для того, чтобы каждый N-ый тик происходил
// в момент времени Entry + N*interval
type Loop struct {
	// amplitude определяет количество тиков в секунду
	amplitude int
	// interval определяет интервал между тиками
	interval time.Duration
	// ticker определяет обработчик тиков
	ticker Ticker
	// tick определяет порядковый номер тика
	tick uint
	// start определяет фактическое время начала тика
	start time.Time
	// delta определяет разницу между фактическим и необходимым временем начала тика
	delta time.Duration
	// busy определяет загруженность цикла в процентах
	busy int
}

// NewLoop создает и запускает цикл в отдельной горутине
func NewLoop(a int, t Ticker) Loop {
	l := Loop{
		amplitude: a,
		ticker:    t,
		interval:  time.Second / time.Duration(a),
	}
	go l.Entry()
	log.Printf("[loop]: цикл запущен с интервалом %v\n", l.interval)
	return l
}

// Entry запускает цикл
func (l *Loop) Entry() {

	// Обрабатываем первый тик
	l.start = time.Now()
	l.ticker.Tick(l.tick)
	time.Sleep(l.interval - time.Since(l.start))

	for {
		start := time.Now()
		duration := start.Sub(l.start)

		l.start = start
		l.delta = l.delta + l.interval - duration
		l.tick++
		l.ticker.Tick(l.tick)

		if l.delta < -time.Millisecond*10 || l.delta > time.Millisecond*10 {
			log.Printf("[loop]: tick %d, duration %s, delta %s\n", l.tick, duration, l.delta)
		}

		busy := time.Since(start)

		l.busy = int(busy * 100 / l.interval)

		time.Sleep(l.interval - busy + l.delta)
	}
}
