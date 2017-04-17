package connect

import (
	"sort"
	"time"
)

// pingStatistics определяет статистику о пинге
type pingStatistics struct {
	pings  []time.Duration
	length int
	head   int
	median time.Duration
}

func newPingStatistics(length int) pingStatistics {
	return pingStatistics{
		pings:  make([]time.Duration, length),
		length: length,
	}
}

func (p *pingStatistics) add(ping time.Duration) {

	p.pings[p.head] = ping

	p.head++
	if p.head == p.length {
		p.calcMedian()
		p.head = 0
	}

}

func (p *pingStatistics) calcMedian() {

	//	log.Println("[unsort pings]:", p.pings)
	//	defer log.Println("[sort pings]:", p.pings)

	sort.Slice(p.pings, func(i, j int) bool { return p.pings[i] < p.pings[j] })
	m := p.length / 2

	if p.length%2 == 0 {
		p.median = (p.pings[m+1] - p.pings[m-1]) / 2
	} else {
		p.median = p.pings[m]
	}

}
