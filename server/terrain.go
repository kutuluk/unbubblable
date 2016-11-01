package main

import (
	"math/rand"
	"time"
)

// Ground определяет тайл поверхности
type Ground struct {
	// Type определяет тип тайла
	Type int
	// Name определяет имя тайла
	Name string
	// Speed определяет коэффициент скорости движения по тайлу
	Speed float64
	// Texture определяет номер текстуры в атласе
	Texture int
}

// Grounds определяет виды тайлов поверхности
var Grounds = []Ground{
	{0, "Empty", 0, 0},            // Пустой тайл
	{1, "Grass", 1.0, 1},          // Трава
	{2, "Stone", 1.0, 2},          // Камень
	{3, "Dirt", 1.0, 201},         // Земля
	{4, "Cobblestone", 1.0, 16},   // Булыжник
	{5, "Bedrock", 1.0, 17},       // Коренная порода
	{6, "Sand", 1.0, 142},         // Песок
	{7, "Gravel", 1.0, 19},        // Гравий
	{8, "Thick grass", 1.0, 203},  // Густая трава
	{9, "Tundra grass", 1.0, 202}, // Тудровая трава
}

// Block определяет блок
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
	{0, "Air", 0, 0},            // Пустой блок
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
	// Texture определяет номер текстуры в атласе
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
	// Seed определяет зерно генератора
	Seed int64
	// Map определяет карту
	Map []MapTile
}

// NewMap создает рандомную карту
func NewMap(width, height int) (m Terrain) {
	m.Width = width
	m.Height = height
	m.Map = make([]MapTile, width*height)

	// Генерируем зерно (от времени) и инициализируем ею рандомизатор
	random := rand.New(rand.NewSource(time.Now().UnixNano()))
	m.Seed = random.Int63()
	random = rand.New(rand.NewSource(m.Seed))

	// Заполняем карту рандомными тайлами
	tiles := []int{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 9, 3, 3, 5, 6, 7}
	for i := 0; i < width*height; i++ {
		m.Map[i].Ground = tiles[random.Intn(len(tiles))]
	}

	// Рассаживаем пеньки
	trees := []int{1, 2, 3}
	treesCount := width * height / 16
	for i := 0; i < treesCount; i++ {
		var x, y int
		var block = 1
		for block != 0 {
			x = random.Intn(width - 1)
			y = random.Intn(height - 1)
			block = m.Map[y*height+x].Block
		}
		m.Map[y*height+x].Block = trees[random.Intn(len(trees))]
	}

	// Рассаживаем кустики
	details := []int{1, 2, 3}
	detailsCount := width * height / 16
	for i := 0; i < detailsCount; i++ {
		var x, y int
		var block = 1
		var detail = 1
		for (block != 0) && (detail != 0) {
			x = random.Intn(width - 1)
			y = random.Intn(height - 1)
			block = m.Map[y*height+x].Block
			detail = m.Map[y*height+x].Detail
		}
		m.Map[y*height+x].Detail = details[random.Intn(len(details))]
	}

	return
}
