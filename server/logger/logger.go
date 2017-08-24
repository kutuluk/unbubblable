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

const queueLength = 100

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

type logMessage struct {
	time time.Time
	text string
}

type Logger struct {
	level    Level
	suuid    string
	source   string
	outbound chan<- logMessage
}

func New(suuid, source string) *Logger {
	l := &Logger{
		suuid:  suuid,
		source: source,
	}

	ch := make(chan logMessage, queueLength)
	l.outbound = (chan<- logMessage)(ch)

	go l.writer((<-chan logMessage)(ch))
	return l
}

func (l *Logger) GetLevel() Level {
	return l.level
}

func (l *Logger) SetLevel(level Level) {
	l.level = level
}

// TODO: Сделать writer общим для всех логгеров, так как параллельная запись в базу все равно не возможна

func (l *Logger) writer(inbound <-chan logMessage) {
	for message := range inbound {
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

func (l *Logger) Close() {
	close(l.outbound)
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

		msg := logMessage{time: now, text: fmt.Sprint(level, " (", trace, "): ", message)}

		select {
		case l.outbound <- msg:
		default:
			log.Println("Ошибка записи лога: буфер переполнен")
			log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, msg.text)
		}
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
