package world

import (
	"github.com/kutuluk/unbubblable/server/config"
	"github.com/kutuluk/unbubblable/server/player"
	"github.com/kutuluk/unbubblable/server/terrain"
)

// Instance определяет игровой инстанс
type Instance struct {
	// Name определяет название инстанса
	Name string
	// Terrain определяет ландшафт
	Terrain *terrain.Terrain
	// players определяет игроков в инстансе
	players map[*player.Player]struct{}
}

// NewInstance создает инстанс
func NewInstance(name string, width, height int, seed int64) *Instance {
	return &Instance{
		Name:    name,
		Terrain: terrain.NewTerrain(config.MapChunkSize*width, config.MapChunkSize*height, config.MapChunkSize, seed),
		players: make(map[*player.Player]struct{}),
	}
}

// Join подключает игрока к инстансу
func (i *Instance) Join(player *player.Player) {
	// Добавляем игрока в список
	i.players[player] = struct{}{}

	//	c.SendTerrain()
}

// Tick определяет обработчик тиков симуляции
func (i *Instance) Tick(tick uint) {

	// Перебираем всех игроков
	for p := range i.players {

		// Осуществляем перерасчет
		p.Update(tick)

		// Отправляем сообщение клиенту
		//		p.connect.SendMovement()
		//		p.connect.update()
	}
}
