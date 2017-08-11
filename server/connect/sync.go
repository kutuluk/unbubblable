package connect

import (
	"log"
	"time"

	"github.com/kutuluk/unbubblable/server/logger"
)

const metricLength = 10

type metric struct {
	ping   time.Duration
	offset time.Duration
}

type synchronizer struct {
	pending     bool
	metricStart time.Time
	metricEnd   time.Time

	pendingCorrect bool
	clientStart    time.Time

	metrics       []metric
	offset        time.Duration
	stable        bool
	maxPingIndex  int
	meanPingValue time.Duration
}

func NewSynchronizer() *synchronizer {
	return &synchronizer{
		metrics: make([]metric, 0, metricLength),
	}
}

// Возвращает true, если не ожидается ответ от предыдущего запроса и время еще не синхронизировано
func (s *synchronizer) check() bool {
	if s.pending || s.stable {
		return false
	}
	s.pending = true
	return true
}

// Устанавливает время старта замера метрики
func (s *synchronizer) begin() {
	s.metricStart = time.Now()
}

func (s *synchronizer) handle(serverTime, clientTime time.Time) bool {
	if s.pendingCorrect {
		// Получена коррекция пинга - вычисляем метрику
		return s.calc(serverTime, clientTime)
	}

	// Получен ответ на синхронизацию - запоминаем значения и переходим в режим ожидания коррекции
	s.clientStart = clientTime
	s.metricEnd = serverTime
	s.pendingCorrect = true
	return false
}

func (s *synchronizer) calc(t, clientEnd time.Time) bool {
	clientBuzy := clientEnd.Sub(s.clientStart)
	ping := s.metricEnd.Sub(s.metricStart) - clientBuzy
	if ping < 0 {
		logger.Error("ping:", ping)
	}
	m := metric{
		ping: ping,
		// при положительном значении клиентское время отстает от серверного
		offset: s.metricStart.Add(ping / 2).Sub(s.clientStart),
	}
	logger.Info("clientBuzy:", clientBuzy, "ping:", s.metricEnd.Sub(s.metricStart), "correct ping:", ping, "offset:", m.offset)
	s.pending = false
	s.pendingCorrect = false

	l := len(s.metrics)
	if l < metricLength {
		s.metrics = append(s.metrics, m)
		if ping > s.metrics[s.maxPingIndex].ping {
			s.maxPingIndex = l
		}
		return s.update(false)
	}

	if !s.stable {
		if s.metrics[s.maxPingIndex].ping > ping {
			s.metrics[s.maxPingIndex] = m

			s.maxPingIndex = 0
			maxPingValue := s.metrics[0].ping
			sumPingValues := s.metrics[0].ping
			for i := 1; i < metricLength; i++ {
				if s.metrics[i].ping > maxPingValue {
					maxPingValue = s.metrics[i].ping
					s.maxPingIndex = i
				}
				sumPingValues += s.metrics[i].ping
			}
			meanPingValue := sumPingValues / time.Duration(10)

			if float64(s.metrics[s.maxPingIndex].ping) < float64(meanPingValue)*1.25 {
				s.stable = true
				log.Println("Stable")
				logger.Warn("Получена выборка синхронизирующих метрик со стабильныи пингом", meanPingValue)
				return s.update(true)
			}

			log.Println(s.metrics)
			return s.update(false)
		}
	}

	return false
}

func (s *synchronizer) update(done bool) bool {
	var sumOffsets time.Duration
	for i := 0; i < len(s.metrics); i++ {
		sumOffsets += s.metrics[i].offset
	}
	s.offset = sumOffsets / time.Duration(len(s.metrics))
	return done
}
