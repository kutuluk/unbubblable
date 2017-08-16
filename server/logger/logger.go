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
	"context"
	"fmt"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/kutuluk/unbubblable/server/db"
)

const queueLength = 100

type logMessage struct {
	time time.Time
	text string
}

type Logger struct {
	suuid    string
	source   string
	outbound chan<- logMessage
	cancel   context.CancelFunc
}

func New(suuid, source string) *Logger {
	l := &Logger{
		suuid:  suuid,
		source: source,
	}

	var ctx context.Context
	ctx, l.cancel = context.WithCancel(context.Background())
	ch := make(chan logMessage, queueLength)
	l.outbound = (chan<- logMessage)(ch)

	go l.writer(ctx, (<-chan logMessage)(ch))
	return l
}

// TODO: Сделать writer общим для всех логгеров, так как параллельная запись в базу все равно не возможна

func (l *Logger) writer(ctx context.Context, inbound <-chan logMessage) {
	for {
		select {
		case <-ctx.Done():
			return
		case message := <-inbound:
			var err error
			if l.source == "global" {
				//b := time.Now()
				err = db.AddGlobalLog(message.time, []byte(message.text))
				//log.Println("Длительность AddGlobalLog:", time.Since(b))
			} else {
				//b := time.Now()
				err = db.AddSessionLog(l.suuid, message.time, l.source, []byte(message.text))
				//log.Println("Длительность AddSessionLog:", time.Since(b))
			}

			if err != nil {
				log.Println("Ошибка записи лога:", err)
				log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, message.text)
			}
		}
	}
}

func (l *Logger) Close() {
	l.cancel()
}

func (l *Logger) output(level, message string) {
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

	msg := logMessage{time: now, text: fmt.Sprint(level, " (", trace, "): ", message)}

	select {
	case l.outbound <- msg:
	default:
		log.Println("Ошибка записи лога: буфер переполнен")
		log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, msg.text)
	}
}

func (l *Logger) Debug(a ...interface{}) {
	l.output("DEBUG", fmt.Sprintln(a...))
}

func (l *Logger) Info(a ...interface{}) {
	l.output("INFO", fmt.Sprintln(a...))
}

func (l *Logger) Warn(a ...interface{}) {
	l.output("WARN", fmt.Sprintln(a...))
}

func (l *Logger) Error(a ...interface{}) {
	l.output("ERROR", fmt.Sprintln(a...))
}

func (l *Logger) Panic(a ...interface{}) {
	s := fmt.Sprintln(a...)
	l.output("ERROR", s)
	panic(s)
}

func (l *Logger) Fatal(a ...interface{}) {
	l.output("ERROR", fmt.Sprintln(a...))
	os.Exit(1)
}

var std = New("", "global")

func Debug(a ...interface{}) {
	std.output("DEBUG", fmt.Sprintln(a...))
}

func Info(a ...interface{}) {
	std.output("INFO", fmt.Sprintln(a...))
}

func Warn(a ...interface{}) {
	std.output("WARN", fmt.Sprintln(a...))
}

func Error(a ...interface{}) {
	std.output("ERROR", fmt.Sprintln(a...))
}

func Panic(a ...interface{}) {
	s := fmt.Sprintln(a...)
	std.output("ERROR", s)
	panic(s)
}

func Fatal(a ...interface{}) {
	std.output("ERROR", fmt.Sprintln(a...))
	os.Exit(1)
}
