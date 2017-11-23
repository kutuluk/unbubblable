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

	write := func() {
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
		// Останавливаем таймер
		timer.Stop()
		// Пишем оставшиеся в очереди сообщения
		write()
	}()

	for {
		select {
		case message, ok := <-outbound:
			if !ok {
				// Канал закрыт - выходим
				return
			}

			// Добавляем сообщение в очередь
			queue = append(queue, message)

			if len(queue) == queueLength {
				// Если очередь заполнилась - пишем
				write()
			}

		case <-timer.C:
			// Если настало время - пишем
			write()
		}
	}
}

var outbound chan<- db.LogMessage

// Write пишет в лог сообщение с заданными параметрами без привязки к конкретному логгеру
func Write(source, suuid string, timestamp time.Time, level Level, logger, text string) {
	msg := db.LogMessage{
		Source:    source,
		Suuid:     suuid,
		Timestamp: timestamp,
		Body: db.LogBody{
			Text:   text,
			Level:  int(level),
			Logger: logger,
		},
	}

	select {
	case outbound <- msg:
	default:
		log.Println("Ошибка записи лога: буфер переполнен")
		log.Printf("Cообщение (suuid=\"%s\", source=\"%s\"): [%s] %s", msg.Suuid, msg.Source, msg.Timestamp, msg.Body.Text)
	}
}

// Level определяет уровень логгирования. Сообщения с меньшим уровнем не логируются.
type Level int

// Предустановленные уровни логгера
const (
	TraceLevel Level = iota
	DebugLevel
	InfoLevel
	WarnLevel
	ErrorLevel
	FatalLevel
)

var printLevel = [...]string{"TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"}

func (l Level) String() string {
	return printLevel[l]
}

// Logger определяет логгер, связанный с определенным источником source коннекта suuid
type Logger struct {
	level     Level
	suuid     string
	source    string
	calldepth int
}

// GetLevel возвращает текущий уровень логгера
func (l *Logger) GetLevel() Level {
	return l.level
}

// SetLevel устанавливает уровень логгера
func (l *Logger) SetLevel(level Level) {
	l.level = level
}

func (l *Logger) output(level Level, message string) {
	if level >= l.level {
		now := time.Now().UTC()

		logger := "???"

		_, file, line, ok := runtime.Caller(l.calldepth)
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
			logger = fmt.Sprint(short, ":", line)
		}

		Write(l.source, l.suuid, now, level, logger, message)
	}
}

// Trace пишет в лог с уровнем TraceLevel
func (l *Logger) Trace(a ...interface{}) {
	l.output(TraceLevel, fmt.Sprintln(a...))
}

// Debug пишет в лог с уровнем DebugLevel
func (l *Logger) Debug(a ...interface{}) {
	l.output(DebugLevel, fmt.Sprintln(a...))
}

// Info пишет в лог с уровнем InfoLevel
func (l *Logger) Info(a ...interface{}) {
	l.output(InfoLevel, fmt.Sprintln(a...))
}

// Warn пишет в лог с уровнем WarnLevel
func (l *Logger) Warn(a ...interface{}) {
	l.output(WarnLevel, fmt.Sprintln(a...))
}

// Error пишет в лог с уровнем ErrorLevel
func (l *Logger) Error(a ...interface{}) {
	l.output(ErrorLevel, fmt.Sprintln(a...))
}

// Panic пишет в лог с уровнем FatalLevel и вызывает панику
func (l *Logger) Panic(a ...interface{}) {
	s := fmt.Sprintln(a...)
	l.output(FatalLevel, s)
	panic(s)
}

// Fatal пишет в лог с уровнем FatalLevel и завершает программу
func (l *Logger) Fatal(a ...interface{}) {
	l.output(FatalLevel, fmt.Sprintln(a...))
	os.Exit(1)
}

// New создает новый логгер, привязанный к ресурсу source коннекта suuid
func New(suuid, source string) *Logger {
	return &Logger{
		suuid:     suuid,
		source:    source,
		calldepth: 2,
	}
}

var std = &Logger{
	suuid:     "",
	source:    "global",
	calldepth: 3,
}

// GetLevel возвращает текущий уровень глобального логгера
func GetLevel() Level {
	return std.GetLevel()
}

// SetLevel устанавливает уровень глобального логгера
func SetLevel(level Level) {
	std.SetLevel(level)
}

// Trace пишет в глобальный лог с уровнем TraceLevel
func Trace(a ...interface{}) {
	std.Trace(a...)
}

// Debug пишет в глобальный лог с уровнем DebugLevel
func Debug(a ...interface{}) {
	std.Debug(a...)
}

// Info пишет в глобальный лог с уровнем InfoLevel
func Info(a ...interface{}) {
	std.Info(a...)
}

// Warn пишет в глобальный лог с уровнем WarnLevel
func Warn(a ...interface{}) {
	std.Warn(a...)
}

// Error пишет в глобальный лог с уровнем ErrorLevel
func Error(a ...interface{}) {
	std.Error(a...)
}

// Panic пишет в глобальный лог с уровнем FatalLevel и вызывает пинику
func Panic(a ...interface{}) {
	std.Panic(a...)
}

// Fatal пишет в глобальный лог с уровнем FatalLevel и завершает программу
func Fatal(a ...interface{}) {
	std.Fatal(a...)
}

func init() {
	ch := make(chan db.LogMessage, queueLength)
	outbound = (chan<- db.LogMessage)(ch)
	go writer(ch)
}
