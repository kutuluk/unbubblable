package connect

import (
	"sort"
	"time"
)

// PingInfo определяет статистику о пинге
type PingInfo struct {
	durations []time.Duration
	interval  int
	frame     int
	head      int
	median    time.Duration
}

func newPings(length, interval int) PingInfo {
	return PingInfo{
		durations: make([]time.Duration, length),
		interval:  interval,
		head:      length - 1,
	}
}

func (p *PingInfo) add(ping time.Duration) {

	p.head++
	if p.head == len(p.durations) {
		p.head = 0
	}

	p.durations[p.head] = ping

	p.frame++
	if p.frame == p.interval {
		p.frame = 0
		p.calcMedian()
	}

}

func (p *PingInfo) calcMedian() time.Duration {

	s := make([]time.Duration, len(p.durations))
	copy(s, p.durations)
	sort.Slice(s, func(i, j int) bool { return s[i] < s[j] })

	l := len(s)
	if l%2 == 0 {
		p.median = (s[l/2+1] - s[l/2-1]) / 2
	} else {
		p.median = s[l/2]
	}

	//	log.Println("[unsort pings]:", p.durations)
	//	log.Println("[sort pings]:", s)
	//	log.Println("[median]:", p.median)

	return p.median
}
