package loop

import (
	"time"

	"github.com/kutuluk/unbubblable/server/logger"
)

// Ticker определяет интерфейс обработчика тиков
type Ticker interface {
	Tick(uint)
}

// Loop определяет цикл, старающийся "тикать" через равные промежутки времени
// и корректирующий момент следующего тика для того, чтобы каждый N-ый тик происходил
// в момент времени Entry + N*interval
type Loop struct {
	// frequency определяет количество тиков в секунду
	frequency int
	// interval определяет интервал между тиками
	interval time.Duration
	// ticker определяет обработчик тиков
	ticker Ticker
	// tick определяет порядковый номер тика
	tick uint
	// start определяет фактическое время начала тика
	start time.Time
	// busy определяет загруженность цикла в процентах
	busy int
}

// NewLoop создает и запускает цикл в отдельной горутине
func NewLoop(f int, t Ticker) *Loop {
	l := &Loop{
		frequency: f,
		ticker:    t,
		interval:  time.Second / time.Duration(f),
	}
	go l.Entry()
	logger.Info("Игровой цикл запущен с интервалом", l.interval)

	return l
}

// Entry запускает цикл
func (l *Loop) Entry() {

	entry := time.Now()

	for {
		l.start = time.Now()
		calc := entry.Add(l.interval * time.Duration(l.tick))
		delta := l.start.Sub(calc)

		logger.Debug("Тик:", l.tick, "delta:", delta)
		l.ticker.Tick(l.tick)

		busy := time.Since(l.start)
		l.busy = int(busy * 100 / l.interval)

		time.Sleep(l.interval - busy - delta)
		l.tick++
	}
}
