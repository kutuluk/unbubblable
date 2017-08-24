package connect

import (
	"sort"
	"time"
)

// pingStatistics определяет статистику о пинге
// TODO: в случае необходимости можно добавить вложенные аналогичные структуры
// любого уровня вложенности для получения более длительной статистики
type pingStatistics struct {
	pings     []time.Duration
	pingStart time.Time
	pending   bool
	length    int
	even      bool
	head      int

	median time.Duration
	delta  time.Duration
}

func newPingStatistics(length int) pingStatistics {
	return pingStatistics{
		pings:  make([]time.Duration, length),
		length: length,
		even:   length%2 == 0,
	}
}

// Если не ожидается ответ от предыдущего пинга, start запоминает текущее время и возвращает true
func (p *pingStatistics) start() bool {
	if p.pending {
		return false
	}
	p.pingStart = time.Now()
	p.pending = true
	return true
}

// done вычисляет продолжительность пинга и, при необходимости, запускает расчет статистики
func (p *pingStatistics) done(t time.Time) {
	p.pings[p.head] = t.Sub(p.pingStart)
	p.pending = false

	p.head++
	if p.head == p.length {
		p.calc()
		p.head = 0
	}
}

// calc обновляет медиану и дельту от предыдущей медианы
func (p *pingStatistics) calc() {
	sort.Slice(p.pings, func(i, j int) bool { return p.pings[i] < p.pings[j] })

	m := p.length / 2
	var median time.Duration
	if p.even {
		median = (p.pings[m] - p.pings[m-1]) / 2
	} else {
		median = p.pings[m]
	}

	p.delta = p.median - median
	p.median = median
}
