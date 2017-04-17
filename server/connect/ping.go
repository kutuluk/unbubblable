package connect

import (
	"sort"
	"time"
)

// pingStatistics определяет статистику о пинге
type pingStatistics struct {
	pings     []time.Duration
	pingStart time.Time
	length    int
	head      int
	median    time.Duration
	delta     time.Duration
}

func newPingStatistics(length int) pingStatistics {
	return pingStatistics{
		pings:  make([]time.Duration, length),
		length: length,
	}
}

// Если пинг еще не отправлен, startPing запоминает текущее время и возвращает true
func (p *pingStatistics) start() bool {
	if p.pingStart.IsZero() {
		p.pingStart = time.Now()
		return true
	}
	return false
}

// donePing вычисляет продолжительность пинга и, при необходимости, запускает расчет статистики
func (p *pingStatistics) done(t time.Time) {
	p.pings[p.head] = t.Sub(p.pingStart)
	p.pingStart = time.Time{}

	p.head++
	if p.head == p.length {
		p.calc()
		p.head = 0
	}
}

// calc вычисляет медиану и дельту от прошлой медины
func (p *pingStatistics) calc() {

	//	log.Println("[unsort pings]:", p.pings)
	//	defer log.Println("[sort pings]:", p.pings)

	sort.Slice(p.pings, func(i, j int) bool { return p.pings[i] < p.pings[j] })

	m := p.length / 2
	var median time.Duration

	if p.length%2 == 0 {
		median = (p.pings[m] - p.pings[m-1]) / 2
	} else {
		median = p.pings[m]
	}

	p.delta = p.median - median
	p.median = median

}
