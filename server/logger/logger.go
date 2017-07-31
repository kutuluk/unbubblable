package logger

import (
	"fmt"
	"log"
	"os"
	"runtime"
	"time"

	"github.com/kutuluk/unbubblable/server/db"
)

type Logger struct {
	//mu     sync.Mutex
	suuid  string
	source string
}

func New(suuid, source string) *Logger {
	return &Logger{
		suuid:  suuid,
		source: source,
	}
}

func (l *Logger) output(level, message string) {
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

	var err error
	if l.source == "global" {
		err = db.AddGlobalLog(time.Now().UTC(), []byte(msg))
	} else {
		err = db.AddSessionLog(l.suuid, time.Now().UTC(), l.source, []byte(msg))
	}

	if err != nil {
		log.Println("Ошибка записи лога:", err)
		log.Printf("Cообщение (suuid=%s, source=%s): %s", l.suuid, l.source, msg)
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
