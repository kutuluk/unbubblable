package logger

// FIXME: Писать логи в файлы, используя KVS только для мета-информации (offset)
// или вообще не использовать, чтобы логи были максимально изолированы от сервера
// и могли бы анализироваться/просматриваться без его использования.
// Свод логов из разных источников в одно место станет чуть сложнее, но производительность
// и переносимость увеличится в разы. Можно будет анализировать логи в оффлайн режиме,
// не нагружая сервер

// Пока оставить как есть, для "поиграться" с BoltDB
//
// Логгирование - не задача сервера! Код для этих целей должен быть минимален.

// Необходимо сделать возможность логирования и "из коробки", и на удаленной машине.
// Для этого оформить логгер в виде интерфейса.

// TODO: Придумать, как хранить метаинформацию о логах вне BoltDB

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/kutuluk/unbubblable/server/db"
)

const queueLength = 1000

func writer(outbound <-chan db.LogMessage) {
	queue := make([]db.LogMessage, 0, queueLength)
	timer := time.NewTicker(1 * time.Second)

	update := func() {
		b := time.Now()
		l := len(queue)
		err := db.AddLogsQueue(queue)
		log.Println("Длительность записи логов:", time.Since(b), "записано:", l)
		if err != nil {
			log.Println("Ошибка записи логов:", err)
		}
		queue = queue[:0]
	}

	defer func() {
		timer.Stop()
		update()
	}()

	for {
		select {
		case message, ok := <-outbound:
			if !ok {
				// Канал закрыт
				return
			}

			queue = append(queue, message)
			if len(queue) == queueLength {
				// Если очередь заполнилась - пишем
				update()
			}

		case <-timer.C:
			// Если настало время - пишем
			update()
		}
	}
}

var outbound chan<- db.LogMessage

func Write(source, suuid string, timestamp time.Time, text string) {
	msg := db.LogMessage{
		Source:    source,
		Suuid:     suuid,
		Timestamp: timestamp,
		Text:      text,
	}

	select {
	case outbound <- msg:
	default:
		log.Println("Ошибка записи лога: буфер переполнен")
		log.Printf("Cообщение (suuid=\"%s\", source=\"%s\"): [%s] %s", msg.Suuid, msg.Source, msg.Timestamp, msg.Text)
	}
}

type Level int

const (
	DebugLevel Level = iota
	InfoLevel
	WarnLevel
	ErrorLevel
	FatalLevel
)

var printLevel = [...]string{"DEBUG", "INFO", "WARN", "ERROR", "FATAL"}

func (l Level) String() string {
	return printLevel[l]
}

type Logger struct {
	level  Level
	suuid  string
	source string
}

func New(suuid, source string) *Logger {
	return &Logger{
		suuid:  suuid,
		source: source,
	}
}

func (l *Logger) GetLevel() Level {
	return l.level
}

func (l *Logger) SetLevel(level Level) {
	l.level = level
}

func (l *Logger) output(level Level, message string) {
	if level >= l.level {
		now := time.Now().UTC()

		trace := "???"

		_, file, line, ok := runtime.Caller(2)
		if ok {
			short := file
			for i := len(file) - 1; i > 0; i-- {
				if file[i] == '/' {
					short = file[i+1:]
					break
				}
			}
			file = short
			for i := len(file) - 1; i > 0; i-- {
				if file[i] == '.' {
					short = file[:i]
					break
				}
			}
			trace = fmt.Sprint(short, ":", line)
		}

		Write(l.source, l.suuid, now, fmt.Sprint(level, " (", trace, "): ", message))
	}
}

func (l *Logger) Debug(a ...interface{}) {
	l.output(DebugLevel, fmt.Sprintln(a...))
}

func (l *Logger) Info(a ...interface{}) {
	l.output(InfoLevel, fmt.Sprintln(a...))
}

func (l *Logger) Warn(a ...interface{}) {
	l.output(WarnLevel, fmt.Sprintln(a...))
}

func (l *Logger) Error(a ...interface{}) {
	l.output(ErrorLevel, fmt.Sprintln(a...))
}

func (l *Logger) Panic(a ...interface{}) {
	s := fmt.Sprintln(a...)
	l.output(FatalLevel, s)
	panic(s)
}

func (l *Logger) Fatal(a ...interface{}) {
	l.output(FatalLevel, fmt.Sprintln(a...))
	os.Exit(1)
}

var std = New("", "global")

func GetLevel() Level {
	return std.GetLevel()
}

func SetLevel(level Level) {
	std.SetLevel(level)
}

func Debug(a ...interface{}) {
	std.output(DebugLevel, fmt.Sprintln(a...))
}

func Info(a ...interface{}) {
	std.output(InfoLevel, fmt.Sprintln(a...))
}

func Warn(a ...interface{}) {
	std.output(WarnLevel, fmt.Sprintln(a...))
}

func Error(a ...interface{}) {
	std.output(ErrorLevel, fmt.Sprintln(a...))
}

func Panic(a ...interface{}) {
	s := fmt.Sprintln(a...)
	std.output(FatalLevel, s)
	panic(s)
}

func Fatal(a ...interface{}) {
	std.output(FatalLevel, fmt.Sprintln(a...))
	os.Exit(1)
}

func init() {
	ch := make(chan db.LogMessage, queueLength)
	outbound = (chan<- db.LogMessage)(ch)

	go writer((<-chan db.LogMessage)(ch))
}
