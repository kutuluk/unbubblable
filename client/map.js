function Tile(ground, block, detail) {

    this.ground = ground || 0;
    this.block = block || 0;
    this.detail = detail || 0;

}

Tile.prototype = {

    constructor: Tile,

    set: function (ground, block, detail) {

        this.ground = ground;
        this.block = block;
        this.detail = detail;

		return this;

    },

	clone: function () {

		return new this.constructor( this.ground, this.block, this.detail );

	},

	copy: function ( t ) {

        this.ground = t.ground;
        this.block = t.block;
        this.detail = t.detail;

		return this;

	},

}

function Chunk(terrain) {

    this.terrain = terrain;

    this.tiles = new Array(terrain.ChunkSize * terrain.ChunkSize);
    for (var i = 0; i < terrain.ChunkSize * terrain.ChunkSize; i++) {
        this.tiles[i] = new Tile();
    }

}

function Terrain(width, height, chunkSize, atlas) {

    this.width = width;
    this.height = height;
    this.chunkSize = chunkSize;
    this.atlas = atlas;

    this.chanks = [];

    this.grounds = [0, 1, 2, 201, 16, 17, 142, 19, 203, 202];
    this.blocks = [[0, 0], [20, 21], [116, 21], [117, 21]];
    this.details = [0, 39, 200, 55];

    // Заполняем общий вершинный буфер для чанков
    this.verticesBuffer = [];
    for (var z = 0; z < 2; z++) {
        for (var y = 0; y < chunkSize + 1; y++) {
            for (var x = 0; x < chunkSize + 1; x++) {
                this.verticesBuffer.push(new THREE.Vector3(x, y, z));
            }
        }
    }
    // Смещение индексов верхних вершин в буфере
    this.verticesTopOffset = (chunkSize + 1) * (chunkSize + 1);

}

export { Terrain };