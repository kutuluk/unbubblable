package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/boltdb/bolt"
	"github.com/gorilla/websocket"
	"github.com/ventu-io/go-shortid"

	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/db"
	"github.com/kutuluk/unbubblable/server/hub"
	"github.com/kutuluk/unbubblable/server/logger"
	"github.com/kutuluk/unbubblable/server/loop"
)

const (
	httpPort  = "8080"
	httpsPort = "80443"

	//RFC3339Milli = "2006-01-02T15:04:05.000Z"
	//RFC3339Micro = "2006-01-02T15:04:05.000000Z"
)

var upgrader = websocket.Upgrader{}
var h *hub.Hub
var l *loop.Loop

func cookier(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//suuid, err := shortid.Generate()
		suuid := shortid.MustGenerate()

		// Записываем коннект в базу
		err := db.AddSession(suuid)
		if err != nil {
			logger.Error(err)
			return
		}

		cookie := &http.Cookie{
			Name:  "session",
			Value: suuid,
		}
		http.SetCookie(w, cookie)
		h.ServeHTTP(w, r)
	})
}

func cookierFunc(h http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//suuid, err := shortid.Generate()
		suuid := shortid.MustGenerate()

		// Записываем коннект в базу
		err := db.AddSession(suuid)
		if err != nil {
			logger.Error(err)
			return
		}

		logger.New(suuid, "server").Info("Зарегистрирована новая сессия", suuid)

		http.SetCookie(w, &http.Cookie{
			Name:  "session",
			Value: suuid,
		})
		h(w, r)
	})
}

func redirect(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r,
		//"https://" + r.Host + r.URL.String(),
		"https://"+strings.Split(r.Host, ":")[0]+":"+httpsPort+r.URL.String(),
		http.StatusMovedPermanently)
}

// Информационная страница о статусе сервера
func status(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Unbubblable "+VERSION+" ("+BUILD+") "+BUILD_DATE)
	fmt.Fprintln(w, "Коннектов: ", h.Count())
}

// Лог
func logs(w http.ResponseWriter, r *http.Request) {
	suuid, err := r.Cookie("session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error(err)
		return
	}

	err = db.DB.View(func(tx *bolt.Tx) error {

		sessions := tx.Bucket([]byte("sessions"))
		if sessions == nil {
			return bolt.ErrBucketNotFound
		}

		session := sessions.Bucket([]byte(suuid.Value))
		if session == nil {
			return bolt.ErrBucketNotFound
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
			Time   string `json:"time"`
			Source string `json:"source"`
			Msg    string `json:"msg"`
		}

		messages := make([]logMessage, 0, clientLog.Stats().KeyN+serverLog.Stats().KeyN)

		var source string

		appender := func(k, v []byte) error {
			message := logMessage{
				Time:   string(k),
				Source: source,
				Msg:    string(v),
			}
			messages = append(messages, message)
			return nil
		}

		source = "client"
		clientLog.ForEach(appender)
		source = "server"
		serverLog.ForEach(appender)

		c := globalLog.Cursor()
		min, _ := serverLog.Cursor().First()
		max, _ := serverLog.Cursor().Last()

		for k, v := c.Seek(min); k != nil && bytes.Compare(k, max) <= 0; k, v = c.Next() {
			message := logMessage{
				Time:   string(k),
				Source: "global",
				Msg:    string(v),
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
		fmt.Fprintln(w, `"session":"`+suuid.Value+`",`)
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

	fmt.Fprintln(w, "OK")

	// Вычленяем suuid
	m := string(body)
	s := strings.Index(m, ">")
	suuid := m[1:s]
	m = m[s+2:]

	// Вычленяем временную метку
	t := strings.Index(m, "]")
	timeStr := m[1:t]
	m = m[t+2:]

	// Парсим временную метку
	timeValue, err := time.Parse(time.RFC3339Nano, timeStr)
	if err != nil {
		logger.Error(err)
		return
	}

	// Записываем в лог
	err = db.AddSessionLog(suuid, timeValue, "client", []byte(m))
	if err != nil {
		logger.Error(err)
	}
}

// Обработчик запросов на соединения по протоколу Websocket
func ws(w http.ResponseWriter, r *http.Request) {
	suuid, err := r.Cookie("session")
	if err != nil {
		/*		if err != http.ErrNoCookie {
					fmt.Fprint(w, err)
					return
				} else {
					err = nil
				}
		*/
		http.Error(w, err.Error(), http.StatusInternalServerError)
		logger.Error(err)
		return
	}

	// Создаем соединение
	connect, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("Не удалось создать websocket-соединение:", err)
		return
	}
	// Добавляем соединение в хаб коннектов
	h.Join(connect, suuid.Value)
}

func logf(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "../public/log.html")
}

func play(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "../public/index.html")
}

func main() {
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
	//mux.Handle("/", cookier(http.StripPrefix("/", http.FileServer(http.Dir("../public")))))
	mux.Handle("/play", cookierFunc(play))
	mux.HandleFunc("/status", status)
	mux.HandleFunc("/logger", logAPI)
	mux.HandleFunc("/log", logs)
	mux.HandleFunc("/logf", logf)
	mux.HandleFunc("/ws", ws)

	// Запускаем http-сервер
	err = http.ListenAndServe(":"+httpPort, mux)
	if err != nil {
		logger.Fatal("[http]:", err)
	}
}
