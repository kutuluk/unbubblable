package timeid

import (
	"encoding/binary"
	"errors"
	"sync/atomic"
	"time"
)

// Упрощенная версия https://github.com/gocql/gocql/blob/master/uuid.go

// TimeID определяет id, состоящий из времени и добавочного значения, используемого для обеспечения уникальности
type TimeID [10]byte

var sequence uint32
var timeBase = time.Date(1582, time.October, 15, 0, 0, 0, 0, time.UTC).Unix()

// FromBytes конвертирует слайс байт в TimeID.
func FromBytes(input []byte) (TimeID, error) {
	var id TimeID

	if len(input) != 10 {
		return id, errors.New("TimeIDs must be exactly 10 bytes long")
	}

	copy(id[:], input)
	return id, nil
}

// FromNow генерирует TimeID из текущего времени.
func FromNow() TimeID {
	return FromTime(time.Now())
}

// FromTime генерирует TimeID из заданного времени.
func FromTime(t time.Time) (id TimeID) {
	t = t.UTC()
	b := uint64(t.Unix()-timeBase)*10000000 + uint64(t.Nanosecond()/100)
	s := atomic.AddUint32(&sequence, 1)

	binary.BigEndian.PutUint64(id[:8], b)
	binary.BigEndian.PutUint16(id[8:], uint16(s))

	return
}

// Bytes возвращает слайс байт из TimeID.
func (id TimeID) Bytes() []byte {
	return id[:]
}

// String возвращает значение TimeID в формате шестнадцетиричного xxxxxxxxxxxxxxxx-xx.
func (id TimeID) String() string {
	var offsets = [...]int{0, 2, 4, 6, 8, 10, 12, 14, 17, 19}
	const hexString = "0123456789abcdef"
	r := make([]byte, 21)
	for i, b := range id {
		r[offsets[i]] = hexString[b>>4]
		r[offsets[i]+1] = hexString[b&0xF]
	}
	r[16] = '-'
	return string(r)
}

// Time возвращает время из TimeID.
func (id TimeID) Time() time.Time {
	t := int64(binary.BigEndian.Uint64(id[:8]))

	sec := t / 1e7
	nsec := (t % 1e7) * 100
	return time.Unix(sec+timeBase, nsec).UTC()
}

// Sequence возвращает добавочную часть TimeID.
func (id TimeID) Sequence() int {
	return int(binary.BigEndian.Uint16(id[8:]))
}
