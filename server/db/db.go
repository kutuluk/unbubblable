package db

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/boltdb/bolt"

	"github.com/kutuluk/unbubblable/server/timeid"
)

const fmtRFC3339Micro = "2006-01-02T15:04:05.000000Z"

var DB *bolt.DB

type LogBody struct {
	Level      int    `json:"level"`
	Logger     string `json:"logger"`
	Text       string `json:"text"`
	Stacktrace string `json:"stacktrace"`
}

type LogMessage struct {
	Source    string
	Suuid     string
	Timestamp time.Time
	Body      LogBody
}

// Init инициализирует базу данных
func Init() (err error) {
	DB, err = bolt.Open("./data/data.db", 0644, nil)
	if err != nil {
		return err
	}

	tx, err := DB.Begin(true)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.CreateBucketIfNotExists([]byte("sessions"))
	if err != nil {
		return err
	}

	_, err = tx.CreateBucketIfNotExists([]byte("log"))
	if err != nil {
		return err
	}

	return tx.Commit()
}

// Close закрывает базу данных
func Close() {
	DB.Close()
}

func AddSession(suuid string) error {
	return DB.Batch(func(tx *bolt.Tx) error {
		sessions := tx.Bucket([]byte("sessions"))
		if sessions == nil {
			return bolt.ErrBucketNotFound
		}

		// Создаем баккет сессии
		session, err := sessions.CreateBucket([]byte(suuid))
		if err != nil {
			return err
		}

		// Создаем баккет логов сервера
		_, err = session.CreateBucket([]byte("server"))
		if err != nil {
			return err
		}

		// Создаем баккет логов клиента
		_, err = session.CreateBucket([]byte("client"))
		if err != nil {
			return err
		}

		/*
			// Генерируем информацию о коннекте
			buf, err := json.Marshal(&struct {
				Start  string `json:"start"`
				Offset string `json:"offset"`
			}{
				Start:  time.Now().UTC().Format(fmtRFC3339Micro),
				Offset: "",
			})
			if err != nil {
				return err
			}

			// Записываем информацию о коннекте
			err = connect.Put([]byte("info"), buf)
			return err
		*/

		// Записываем информацию о времени создания сессии
		//err = session.Put([]byte("start"), []byte(time.Now().UTC().Format(fmtRFC3339Micro)))
		err = session.Put([]byte("start"), timeid.FromNow().Bytes())
		if err != nil {
			return err
		}

		// Записываем информацию о временном смещении между сервером и клиентом
		err = session.Put([]byte("offset"), []byte("0"))
		if err != nil {
			return err
		}

		return nil
	})
}

func getSessionBucket(suuid string, tx *bolt.Tx) (*bolt.Bucket, error) {
	sessions := tx.Bucket([]byte("sessions"))
	if sessions == nil {
		return nil, bolt.ErrBucketNotFound
	}

	session := sessions.Bucket([]byte(suuid))
	if session == nil {
		return nil, bolt.ErrBucketNotFound
	}

	return session, nil
}

func UpdateSessionOffset(suuid string, offset time.Duration) error {
	return DB.Batch(func(tx *bolt.Tx) error {
		session, err := getSessionBucket(suuid, tx)
		if err != nil {
			return err
		}

		// Записываем информацию о временном смещении между сервером и клиентом
		err = session.Put([]byte("offset"), []byte(offset.String()))
		if err != nil {
			return err
		}

		return nil
	})
}

func SaveSession(suuid string, offset time.Duration, received, sent int) error {
	return DB.Batch(func(tx *bolt.Tx) error {
		session, err := getSessionBucket(suuid, tx)
		if err != nil {
			return err
		}

		// Записываем информацию о сессии
		err = session.Put([]byte("offset"), []byte(offset.String()))
		if err != nil {
			return err
		}
		err = session.Put([]byte("received"), []byte(strconv.Itoa(received)))
		if err != nil {
			return err
		}
		err = session.Put([]byte("sent"), []byte(strconv.Itoa(received)))
		if err != nil {
			return err
		}

		return nil
	})
}

func AddLogsQueue(queue []LogMessage) error {
	return DB.Update(func(tx *bolt.Tx) error {
		//return DB.Batch(func(tx *bolt.Tx) error {
		var global *bolt.Bucket

		for _, message := range queue {
			var bucket *bolt.Bucket
			if message.Source == "global" {
				if global != nil {
					// Оптимизация для глобального лога
					bucket = global
				} else {
					bucket = tx.Bucket([]byte("log"))
					if bucket == nil {
						return bolt.ErrBucketNotFound
					}
					global = bucket
				}
			} else {
				// TODO: Можно сделать оптимизацию и для сессионных логов
				session, err := getSessionBucket(message.Suuid, tx)
				if err != nil {
					return err
				}

				bucket = session.Bucket([]byte(message.Source))
				if bucket == nil {
					return bolt.ErrBucketNotFound
				}
			}

			// Генерируем лог
			buf, err := json.Marshal(&message.Body)
			if err != nil {
				return err
			}

			// Записываем лог
			err = bucket.Put(timeid.FromTime(message.Timestamp).Bytes(), buf)
			if err != nil {
				return err
			}
		}
		return nil
	})
}
