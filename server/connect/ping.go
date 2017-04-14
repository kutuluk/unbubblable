package connect

import (
	"sort"
	"time"
)

// Durations определяет набор временных отрезков
type Durations []time.Duration

func (d Durations) Len() int           { return len(d) }
func (d Durations) Swap(i, j int)      { d[i], d[j] = d[j], d[i] }
func (d Durations) Less(i, j int) bool { return d[i] < d[j] }

// PingInfo определяет статистику о пинге
type PingInfo struct {
	durations Durations
	interval  int
	frame     int
	head      int
	median    time.Duration
}

func newPings(length, interval int) PingInfo {
	return PingInfo{
		durations: make(Durations, length),
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

	s := make(Durations, len(p.durations))
	copy(s, p.durations)
	sort.Sort(s)

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
