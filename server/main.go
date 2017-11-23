package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/boltdb/bolt"
	"github.com/gorilla/websocket"
	"github.com/pkg/profile"
	"github.com/satori/go.uuid"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/db"
	"github.com/kutuluk/unbubblable/server/hub"
	"github.com/kutuluk/unbubblable/server/logger"
	"github.com/kutuluk/unbubblable/server/loop"
	"github.com/kutuluk/unbubblable/server/timeid"
)

const (
	httpPort  = "8080"
	httpsPort = "80443"

	//RFC3339Milli = "2006-01-02T15:04:05.000Z"
	//RFC3339Micro = "2006-01-02T15:04:05.000000Z"
	fmtRFC3339Micro = "2006-01-02T15:04:05.000000Z"
)

var upgrader = websocket.Upgrader{}
var h *hub.Hub
var l *loop.Loop

type contextKeys int

const sessionKey contextKeys = 0

func cookier(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var id uuid.UUID

		cookie, err := r.Cookie("session")

		if err == nil {
			id, err = uuid.FromString(cookie.Value)
		}

		// Если не удалось прочитать или распарсить сессию из куки создаем новую
		if err != nil {
			id = uuid.NewV4()
			http.SetCookie(w, &http.Cookie{
				Name:  "session",
				Value: id.String(),
			})
		}

		ctx := context.WithValue(r.Context(), sessionKey, id)
		h.ServeHTTP(w, r.WithContext(ctx))
	}
}

func redirect(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r,
		//"https://" + r.Host + r.URL.String(),
		"https://"+strings.Split(r.Host, ":")[0]+":"+httpsPort+r.URL.String(),
		http.StatusMovedPermanently)
}

// Информационная страница о статусе сервера
func status(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Unbubblable "+VERSION+" ("+BUILD+") "+DATE)
	fmt.Fprintln(w, "Коннектов: ", h.Count())
}

// Лог
func logs(w http.ResponseWriter, r *http.Request) {
	err := db.DB.View(func(tx *bolt.Tx) error {

		sessions := tx.Bucket([]byte("sessions"))
		if sessions == nil {
			return bolt.ErrBucketNotFound
		}

		// ---------
		var lastConnect *bolt.Bucket
		var lastTime time.Time
		var lastSUUID string

		last := func(k, v []byte) error {
			session := sessions.Bucket(k)
			if session == nil {
				return bolt.ErrBucketNotFound
			}

			start := session.Get([]byte("start"))
			if start == nil {
				return errors.New("start not found")
			}

			timeID, err := timeid.FromBytes(start)
			if err != nil {
				return err
			}

			timeValue := timeID.Time()

			if timeValue.After(lastTime) {
				lastTime = timeValue
				lastConnect = session
				lastSUUID = string(k)
			}

			return nil
		}

		err := sessions.ForEach(last)
		if err != nil {
			return err
		}
		// ----

		session := lastConnect

		offsetValue := session.Get([]byte("offset"))
		var offset string
		if offsetValue != nil {
			offset = string(offsetValue)
		} else {
			offset = "nil"
		}
		offsetDuration, err := time.ParseDuration(offset)
		if err != nil {
			offsetDuration = 0
		}

		clientLog := session.Bucket([]byte("client"))
		if clientLog == nil {
			return bolt.ErrBucketNotFound
		}

		serverLog := session.Bucket([]byte("server"))
		if serverLog == nil {
			return bolt.ErrBucketNotFound
		}

		globalLog := tx.Bucket([]byte("log"))
		if globalLog == nil {
			return bolt.ErrBucketNotFound
		}

		type logMessage struct {
			Time   string     `json:"time"`
			Source string     `json:"source"`
			Body   db.LogBody `json:"body"`
		}

		messages := make([]logMessage, 0, clientLog.Stats().KeyN+serverLog.Stats().KeyN)

		var source string

		appender := func(offset time.Duration) func(k, v []byte) error {
			return func(k, v []byte) error {
				tid, err := timeid.FromBytes(k)
				if err != nil {
					return err
				}
				t := tid.Time()
				// TODO: сделать коррекцию времени на клиенте
				t = t.Add(offset)

				var body db.LogBody
				err = json.Unmarshal(v, &body)
				if err != nil {
					return err
				}

				message := logMessage{
					Time:   t.Format(fmtRFC3339Micro),
					Source: source,
					Body:   body,
				}
				messages = append(messages, message)
				return nil
			}
		}

		source = "client"
		clientLog.ForEach(appender(offsetDuration))
		source = "server"
		serverLog.ForEach(appender(0))

		c := globalLog.Cursor()

		//min, _ := serverLog.Cursor().First()

		/*
			start := session.Get([]byte("start"))
			startTime, err := time.Parse(fmtRFC3339Micro, string(start))
			min := timeid.FromTime(startTime).Bytes()
		*/

		min := session.Get([]byte("start"))
		max, _ := serverLog.Cursor().Last()

		for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
			tid, err := timeid.FromBytes(k)
			if err != nil {
				break
			}

			var body db.LogBody
			err = json.Unmarshal(v, &body)
			if err != nil {
				return err
			}

			message := logMessage{
				Time:   tid.Time().Format(fmtRFC3339Micro),
				Source: "global",
				Body:   body,
			}
			messages = append(messages, message)
		}

		//sort.Slice(messages, func(i, j int) bool { return messages[i].Time < messages[j].Time })

		// Генерируем информацию о сессии
		buf, err := json.Marshal(&messages)
		if err != nil {
			return err
		}

		fmt.Fprintln(w, `{`)
		fmt.Fprintln(w, `"connect":"`+lastSUUID+`",`)
		fmt.Fprintln(w, `"offset":"`+offset+`",`)
		fmt.Fprintln(w, `"logs":`)
		fmt.Fprintln(w, string(buf))
		fmt.Fprintln(w, `}`)

		return nil
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error(err)
		return
	}

}

// API для клиентских логов
func logAPI(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error(err)
		return
	}

	token := ""
	authorization := strings.Split(r.Header.Get("Authorization"), " ")
	if authorization[0] == "Bearer" {
		token = authorization[1]
	}

	if token == "" {
		err := errors.New("Токен отсутствует")
		http.Error(w, err.Error(), http.StatusUnauthorized)
		logger.Error(err)
		return
	}

	fmt.Fprintln(w, "OK")

	if r.Header.Get("Content-Type") == "application/json" {
		type Message struct {
			Message    string       `json:"message"`
			Level      logger.Level `json:"level"`
			Logger     string       `json:"logger"`
			Timestamp  string       `json:"timestamp"`
			Stacktrace string       `json:"stacktrace"`
		}

		type Messages struct {
			Messages []Message `json:"logs"`
		}

		messages := Messages{}
		err = json.Unmarshal(body, &messages)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			logger.Error(err)
			return
		}

		for _, message := range messages.Messages {
			// Парсим временную метку
			timeValue, err := time.Parse(time.RFC3339Nano, message.Timestamp)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				logger.Error(err)
				return
			}

			// Записываем лог
			logger.Write("client", token, timeValue, message.Level, message.Logger, message.Message)
		}
	}
}

// Обработчик запросов на соединения по протоколу WebSocket
func upgrade(w http.ResponseWriter, r *http.Request) {
	// Создаем websocket-соединение
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error("Не удалось создать websocket-соединение:", err)
		return
	}

	// Добавляем соединение в хаб коннектов
	err = h.Join(ws, r.Context().Value(sessionKey).(uuid.UUID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error("Не удалось дабавить соединение в хаб:", err)
		return
	}

	// FIXME: Надо ли?
	fmt.Fprintln(w, "OK")
}

func logf(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "../public/log.html")
}

func main() {
	defer profile.Start(profile.ProfilePath("./prof")).Stop()

	log.SetFlags(log.LUTC | log.Ldate | log.Lmicroseconds | log.Lshortfile)

	err := db.Init()
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}

	h = hub.NewHub()
	l = loop.NewLoop(config.LoopFrequency, h)

	logger.Info("Сервер успешно запущен")

	mux := http.NewServeMux()

	// Определяем обработчики
	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../public"))))
	mux.HandleFunc("/status", status)
	mux.HandleFunc("/logger", logAPI)
	mux.HandleFunc("/log", logs)
	mux.HandleFunc("/logf", logf)
	mux.HandleFunc("/ws", upgrade)

	// Запускаем http-сервер
	err = http.ListenAndServe(":"+httpPort, cookier(mux))
	if err != nil {
		logger.Fatal("[http]:", err)
	}
}
