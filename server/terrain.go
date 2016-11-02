package main

import (
	"log"
	"math/rand"
	"time"

	"github.com/golang/protobuf/proto"
	"github.com/kutuluk/unbubblable/server/proto"
)

// Ground определяет тайл поверхности
type Ground struct {
	// Type определяет тип тайла
	Type int
	// Name определяет имя тайла
	Name string
	// Speed определяет коэффициент скорости движения по тайлу
	Speed float64
	// Texture определяет номер текстуры тайла в атласе
	Texture int
}

// Grounds определяет виды тайлов поверхности
var Grounds = []Ground{
	{0, "Empty", 0, 0},            // Пустой тайл
	{1, "Grass", 1.0, 1},          // Трава
	{2, "Stone", 1.0, 2},          // Камень
	{3, "Dirt", 1.0, 201},         // Земля
	{4, "Cobblestone", 1.0, 16},   // Булыжник
	{5, "Blackrock", 1.0, 17},     // Черный камень
	{6, "Sand", 1.0, 142},         // Песок
	{7, "Gravel", 1.0, 19},        // Гравий
	{8, "Thick grass", 1.0, 203},  // Густая трава
	{9, "Tundra grass", 1.0, 202}, // Тудровая трава
}

// Block определяет непроходимый блок
type Block struct {
	// Type определяет тип блока
	Type int
	// Name определяет имя блока
	Name string
	// TextureWall определяет номер текстуры боковых граней в атласе
	TextureWall int
	// TextureTop определяет номер текстуры верхней грани в атласе
	TextureTop int
}

// Blocks определяет виды блоков
var Blocks = []Block{
	{0, "Empty", 0, 0},          // Пустой блок (проходимый)
	{1, "Oak Tree", 20, 21},     // Дерево дуб
	{2, "Spruce Tree", 116, 21}, // Дерево ель
	{3, "Birch Tree", 117, 21},  // Дерево береза
}

// Detail определяет деталь
type Detail struct {
	// Type определяет тип детали
	Type int
	// Name определяет имя детали
	Name string
	// Texture определяет номер текстуры детали в атласе
	Texture int
}

// Details определяет виды деталей
var Details = []Detail{
	{0, "Empty", 0},       // Пустая деталь
	{1, "Grass", 39},      // Трава
	{2, "Fern", 200},      // Папоротник
	{3, "Dead Shrub", 55}, // Сухой куст
}

// MapTile определяет тайл карты
type MapTile struct {
	Ground int
	Block  int
	Detail int
}

// Terrain определяет карту
type Terrain struct {
	// Width определяет ширину
	Width int
	// Height определяет высоту
	Height int
	// Seed определяет зерно генератора случайных чисел
	Seed int64
	// Map определяет карту
	Map []MapTile
	// Proto определяет сериализованное сообщение с информацией о карте
	Proto []byte
}

// Instance определяет игровой инстанс
type Instance struct {
	// Name определяет название инстанса
	Name string
	// Terrain определяет карту
	Terrain Terrain
}

// NewTerrain создает рандомную карту
func NewTerrain(width, height int, seed int64) *Terrain {
	// Генерируем случайное зерно, если seed == 0
	for ; seed == 0; seed = rand.New(rand.NewSource(time.Now().UnixNano())).Int63() {
	}

	t := &Terrain{
		Width:  width,
		Height: height,
		Map:    make([]MapTile, width*height),
		Seed:   seed,
	}

	// Инициализируем рандомизатор зерном
	random := rand.New(rand.NewSource(seed))

	// Заполняем поверхность рандомными тайлами
	tiles := []int{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 9, 3, 3, 5, 6, 7}
	for i := 0; i < width*height; i++ {
		t.Map[i].Ground = tiles[random.Intn(len(tiles))]
	}

	// Рассаживаем пеньки
	trees := []int{1, 2, 3}
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

	// Рассаживаем кустики
	//details := []int{1, 2, 3}
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
		//		t.Map[y*height+x].Detail = details[random.Intn(len(details))]
		if t.Map[y*width+x].Ground != 1 {
			log.Print("[!]")
		}
		t.Map[y*width+x].Detail = 3
	}

	// Подготовливаем данные для сериализации
	msgTerrain := new(protocol.Terrain)

	msgTerrain.Width = int32(t.Width)
	msgTerrain.Height = int32(t.Height)
	msgTerrain.Seed = t.Seed
	msgTerrain.Map = make([]*protocol.Terrain_Tile, width*height)

	for i := 0; i < width*height; i++ {
		msgTerrainTile := new(protocol.Terrain_Tile)
		msgTerrainTile.Ground = int32(t.Map[i].Ground)
		msgTerrainTile.Block = int32(t.Map[i].Block)
		msgTerrainTile.Detail = int32(t.Map[i].Detail)

		msgTerrain.Map[i] = msgTerrainTile
	}

	// Сериализуем данные протобафом
	buffer, err := proto.Marshal(msgTerrain)
	if err != nil {
		log.Fatal("[proto terrain]:", err)
	}

	t.Proto = buffer

	return t
}
