package logger

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/kutuluk/unbubblable/server/db"
)

type logMessage struct {
	now time.Time
	msg string
}

type Logger struct {
	//mu     sync.Mutex
	suuid    string
	source   string
	outbound chan logMessage
}

func New(suuid, source string) *Logger {
	l := &Logger{
		suuid:  suuid,
		source: source,
		//outbound: make(chan message, length),
		outbound: make(chan logMessage, 100),
	}

	go l.writer()
	return l
}

func (l *Logger) writer() {
	for {

		select {
		case message, ok := <-l.outbound:
			if !ok {
				// Канал закрыт
				return
			}

			// Пишем лог
			var err error
			if l.source == "global" {
				//b := time.Now()
				err = db.AddGlobalLog(message.now, []byte(message.msg))
				//log.Println("Длительность AddGlobalLog:", time.Since(b))
			} else {
				//b := time.Now()
				err = db.AddSessionLog(l.suuid, message.now, l.source, []byte(message.msg))
				//log.Println("Длительность AddSessionLog:", time.Since(b))
			}

			if err != nil {
				log.Println("Ошибка записи лога:", err)
				log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, message.msg)
			}

		}
	}
}

func (l *Logger) output(level, message string) {
	now := time.Now().UTC()

	trace := "???"

	_, file, line, ok := runtime.Caller(2)
	//l.mu.Lock()
	//defer l.mu.Unlock()
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

	msg := fmt.Sprint(level, " (", trace, "): ", message)

	//log.Println("Длительность подготовки строки для лога:", time.Since(b))

	l.outbound <- logMessage{now: now, msg: msg}
	/*
		go func(now time.Time, msg string) {
			b := time.Now()

			var err error
			if l.source == "global" {
				//b := time.Now()
				err = db.AddGlobalLog(now, []byte(msg))
				//log.Println("Длительность AddGlobalLog:", time.Since(b))
			} else {
				//b := time.Now()
				err = db.AddSessionLog(l.suuid, now, l.source, []byte(msg))
				//log.Println("Длительность AddSessionLog:", time.Since(b))
			}

			if err != nil {
				log.Println("Ошибка записи лога:", err)
				log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, msg)
			}

			log.Println("Длительность output:", time.Since(b))
		}(now, msg)
	*/
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
