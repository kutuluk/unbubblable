package db

import (
	"time"

	"github.com/boltdb/bolt"
)

const fmtRFC3339Micro = "2006-01-02T15:04:05.000000Z"

var DB *bolt.DB

// Init инициализирует базу данных
func Init() (err error) {
	DB, err = bolt.Open("data.db", 0644, nil)
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
	return DB.Update(func(tx *bolt.Tx) error {
		sessions := tx.Bucket([]byte("sessions"))
		if sessions == nil {
			//return errors.New("Баккет сессий отсутствует")
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
		err = session.Put([]byte("start"), []byte(time.Now().UTC().Format(fmtRFC3339Micro)))
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

func addLog(bucket *bolt.Bucket, t time.Time, message []byte) error {
	// Проверяем наличие ключа в баккете
	key := t.Format(fmtRFC3339Micro)
	v := bucket.Get([]byte(key))
	for v != nil {
		// Увеличиваем ключ на микросекунду до тех пор, пока он не станет уникальным в баккете
		t = t.Add(time.Microsecond)
		key = t.Format(fmtRFC3339Micro)
		v = bucket.Get([]byte(key))
	}

	// Записываем сообщение в баккет
	return bucket.Put([]byte(key), message)
}

func AddSessionLog(suuid string, key time.Time, source string, message []byte) error {
	return DB.Update(func(tx *bolt.Tx) error {
		sessions := tx.Bucket([]byte("sessions"))
		if sessions == nil {
			//return errors.New("Баккет сессий отсутствует")
			return bolt.ErrBucketNotFound
		}

		connect := sessions.Bucket([]byte(suuid))
		if connect == nil {
			//return errors.New("Баккет сессии " + suuid + " отсутствует")
			return bolt.ErrBucketNotFound
		}

		log := connect.Bucket([]byte(source))
		if log == nil {
			//return errors.New("Баккет лога сессии " + suuid + "." + source + " отсутствует")
			return bolt.ErrBucketNotFound
		}

		return addLog(log, key, message)
	})
}

func AddGlobalLog(key time.Time, message []byte) error {
	return DB.Update(func(tx *bolt.Tx) error {
		log := tx.Bucket([]byte("log"))
		if log == nil {
			//return errors.New("Баккет лога отсутствует")
			return bolt.ErrBucketNotFound
		}

		return addLog(log, key, message)
	})
}

/*
	seq, err := session.NextSequence()
	if err != nil {
		err := errors.New("Не удалось получить NextSequence")
		log.Println(err)
		return err
	}
	key := strconv.FormatUint(seq, 10)

		//return session.Put([]byte(key), []byte(msg))
	err = session.Put([]byte(key), buf)
	log.Println(err)
	return err
*/

/*
func itob(v int) []byte {
	b := make([]byte, 8)
	binary.BigEndian.PutUint64(b, uint64(v))
	return b
}
*/
