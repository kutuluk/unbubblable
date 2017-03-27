package main

import (
	"log"
	"math/rand"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/kutuluk/unbubblable/server/protocol"
)

// TileGround определяет тайл поверхности
type TileGround struct {
	// Name определяет название тайла
	Name string
	// Speed определяет коэффициент скорости движения по тайлу
	Speed float64
	// Texture определяет номер текстуры тайла в атласе
	Texture int32
}

// TileGrounds определяет набор тайлов поверхности
type TileGrounds []TileGround

// GetID возвращает индекс тайла по названию или 0, если название не найдено
func (t TileGrounds) GetID(name string) int {
	for i, tile := range t {
		if tile.Name == name {
			return i
		}
	}
	return 0
}

// Proto возвращает "протокольную" версию набора
func (t TileGrounds) Proto() (p []*protocol.TileGround) {
	for _, tile := range t {
		p = append(p, &protocol.TileGround{Name: tile.Name, Speed: tile.Speed, Texture: tile.Texture})
	}
	return p
}

// Grounds определяет виды тайлов поверхности
var Grounds = TileGrounds{
	{"Empty", 0, 0},            // Пустой тайл
	{"Grass", 1.0, 1},          // Трава
	{"Stone", 1.0, 2},          // Камень
	{"Dirt", 1.0, 201},         // Земля
	{"Cobblestone", 1.0, 16},   // Булыжник
	{"Blackrock", 1.0, 17},     // Скальная порода
	{"Sand", 1.0, 142},         // Песок
	{"Gravel", 1.0, 19},        // Гравий
	{"Thick grass", 1.0, 203},  // Густая трава
	{"Tundra grass", 1.0, 202}, // Тундровая трава
}

// TileBlock определяет непроходимый блок
type TileBlock struct {
	// Name определяет название блока
	Name string
	// TextureWall определяет номер текстуры боковых граней блока в атласе
	TextureWall int32
	// TextureTop определяет номер текстуры верхней грани блока в атласе
	TextureTop int32
}

// TileBlocks определяет набор непроходимых блоков
type TileBlocks []TileBlock

// GetID возвращает индекс блока по названию или 0, если название не найдено
func (t TileBlocks) GetID(name string) int {
	for i, tile := range t {
		if tile.Name == name {
			return i
		}
	}
	return 0
}

// Proto возвращает "протокольную" версию набора
func (t TileBlocks) Proto() (p []*protocol.TileBlock) {
	for _, tile := range t {
		p = append(p, &protocol.TileBlock{Name: tile.Name, TextureWall: tile.TextureWall, TextureTop: tile.TextureTop})
	}
	return p
}

// Blocks определяет виды непроходимых блоков
var Blocks = TileBlocks{
	{"Empty", 0, 0},          // Пустой блок (проходимый)
	{"Oak Tree", 20, 21},     // Дерево дуб
	{"Spruce Tree", 116, 21}, // Дерево ель
	{"Birch Tree", 117, 21},  // Дерево береза
}

// TileDetail определяет деталь
type TileDetail struct {
	// Name определяет название детали
	Name string
	// Texture определяет номер текстуры детали в атласе
	Texture int32
}

// TileDetails определяет набор деталей
type TileDetails []TileDetail

// GetID возвращает индекс детали по названию или 0, если название не найдено
func (t TileDetails) GetID(name string) int {
	for i, tile := range t {
		if tile.Name == name {
			return i
		}
	}
	return 0
}

// Proto возвращает "протокольную" версию набора
func (t TileDetails) Proto() (p []*protocol.TileDetail) {
	for _, tile := range t {
		p = append(p, &protocol.TileDetail{Name: tile.Name, Texture: tile.Texture})
	}
	return p
}

// Details определяет виды деталей
var Details = TileDetails{
	{"Empty", 0},       // Нет детали
	{"Grass", 39},      // Трава
	{"Fern", 200},      // Папоротник
	{"Dead Shrub", 55}, // Сухой куст
}

// MapTile определяет тайл карты
type MapTile struct {
	Ground int
	Block  int
	Detail int
}

// Chunk определяет чанк карты
type Chunk struct {
	// Index определяет индекс чанка (от левого нижнего угла направо и вверх)
	Index int
	// Proto определяет сериализованное сообщение с информацией о чанке
	Proto []byte
}

// Terrain определяет ландшафт
type Terrain struct {
	// Width определяет ширину
	Width int
	// Height определяет высоту
	Height int
	// Seed определяет зерно генератора случайных чисел
	Seed int64
	// Map определяет карту
	Map []MapTile
	// ChunkSize определяет размер чанка
	ChunkSize int
	// ChunkedWidth определяет ширину в чанках
	ChunkedWidth int
	// ChunkedHeight определяет высоту в чанках
	ChunkedHeight int
	// Chunk определяет чанки
	Chunks []*Chunk
	// Proto определяет сериализованное сообщение с информацией о ландшафте
	Proto []byte
}

// Instance определяет игровой инстанс
type Instance struct {
	// Name определяет название инстанса
	Name string
	// Terrain определяет карту
	Terrain Terrain
}

// NewChank создает чанк по индексу
func (t Terrain) NewChank(i int) *Chunk {

	oy := i / t.ChunkedWidth
	ox := i - oy*t.ChunkedWidth

	// Копируем кусок карты
	m := make([]MapTile, t.ChunkSize*t.ChunkSize)
	for y := 0; y < t.ChunkSize; y++ {
		for x := 0; x < t.ChunkSize; x++ {
			m[y*t.ChunkSize+x] = t.Map[(oy*t.ChunkSize+y)*t.Width+ox*t.ChunkSize+x]
		}
	}

	// Подготовливаем данные для сериализации
	msgChunk := &protocol.GetChunksResponse{
		Index:  int32(i),
		Tiles:  make([]*protocol.GetChunksResponse_Tile, t.ChunkSize*t.ChunkSize),
		Result: protocol.GetChunksResponse_SUCCESS,
	}

	// ToDo: Перенести в верхний цикл и избавиться от промежуточного слайса m
	for i := 0; i < t.ChunkSize*t.ChunkSize; i++ {
		msgChunkTile := new(protocol.GetChunksResponse_Tile)
		msgChunkTile.Ground = int32(m[i].Ground)
		msgChunkTile.Block = int32(m[i].Block)
		msgChunkTile.Detail = int32(m[i].Detail)

		msgChunk.Tiles[i] = msgChunkTile
	}

	// Сериализуем данные протобафом
	buffer, err := proto.Marshal(msgChunk)
	if err != nil {
		log.Fatal("[proto chunk]:", err)
	}

	return &Chunk{
		Index: i,
		Proto: buffer,
	}

}

// NewTerrain создает рандомную карту
func NewTerrain(width, height, chunkSize int, seed int64) *Terrain {
	// Генерируем случайное зерно, если seed == 0
	for ; seed == 0; seed = rand.New(rand.NewSource(time.Now().UnixNano())).Int63() {
	}

	// Для корректной работы размеры карты должны быть кратны chunkSize
	t := &Terrain{
		Width:         width,
		Height:        height,
		Seed:          seed,
		Map:           make([]MapTile, width*height),
		ChunkSize:     chunkSize,
		ChunkedWidth:  width / chunkSize,
		ChunkedHeight: height / chunkSize,
		Chunks:        make([]*Chunk, width*height/chunkSize*chunkSize),
	}

	// Инициализируем рандомизатор зерном
	random := rand.New(rand.NewSource(seed))

	// Создаем и заполняем веса тайлов
	g := Grounds.GetID("Grass")
	g2 := Grounds.GetID("Thick grass")
	g3 := Grounds.GetID("Tundra grass")
	d := Grounds.GetID("Dirt")
	b := Grounds.GetID("Blackrock")
	s := Grounds.GetID("Sand")
	r := Grounds.GetID("Gravel")
	tiles := []int{g, g, g, g, g, g, g, g, g, g, g2, g2, g2, g2, g3, d, d, b, s, r}

	// Заполняем поверхность рандомными тайлами
	for i := 0; i < width*height; i++ {
		t.Map[i].Ground = tiles[random.Intn(len(tiles))]
	}

	// Создаем и заполняем веса пеньков
	t1 := Blocks.GetID("Oak Tree")
	t2 := Blocks.GetID("Spruce Tree")
	t3 := Blocks.GetID("Birch Tree")
	trees := []int{t1, t2, t3}

	// Рассаживаем пеньки
	treesCount := width * height / 16
	for i := 0; i < treesCount; i++ {
		var x, y int
		var block = 1
		for block != 0 {
			x = random.Intn(width)
			y = random.Intn(height)
			block = t.Map[y*width+x].Block
		}
		t.Map[y*width+x].Block = trees[random.Intn(len(trees))]
	}

	ds := Details.GetID("Dead Shrub")
	details := []int{ds}

	// Рассаживаем кустики
	detailsCount := width * height / 32
	for i := 0; i < detailsCount; i++ {
		var x, y int
		var block = 1
		var detail = 1
		var ground = 0
		for !((block == 0) && (detail == 0) && (ground == 1)) {
			x = random.Intn(width)
			y = random.Intn(height)
			block = t.Map[y*width+x].Block
			detail = t.Map[y*width+x].Detail
			ground = t.Map[y*width+x].Ground
		}
		t.Map[y*width+x].Detail = details[random.Intn(len(details))]
	}

	for i := 0; i < t.ChunkedWidth*t.ChunkedHeight; i++ {
		t.Chunks[i] = t.NewChank(i)
	}

	// Подготовливаем данные для сериализации
	msgTerrain := &protocol.Terrain{
		Width:     int32(t.Width),
		Height:    int32(t.Height),
		ChunkSize: int32(t.ChunkSize),
		Seed:      int64(t.Seed),
		Grounds:   Grounds.Proto(),
		Blocks:    Blocks.Proto(),
		Details:   Details.Proto(),
	}

	// Сериализуем данные протобафом
	buffer, err := proto.Marshal(msgTerrain)
	if err != nil {
		log.Fatal("[proto terrain]:", err)
	}

	t.Proto = buffer

	return t
}

// GetChankIndex возвращает индекс чанка по координатам тайла
func (t Terrain) GetChankIndex(x, y int) int {
	xx := x / t.ChunkSize
	yy := y / t.ChunkSize
	return yy*t.ChunkedWidth + xx
}

// GetChankCoord возвращает координаты чанка по индексу
func (t Terrain) GetChankCoord(i int) (x, y int) {
	y = i / t.ChunkedWidth
	x = i - y*t.ChunkedWidth
	return
}
