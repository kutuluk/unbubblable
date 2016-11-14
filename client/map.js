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

        return new this.constructor(this.ground, this.block, this.detail);

    },

    copy: function (t) {

        this.ground = t.ground;
        this.block = t.block;
        this.detail = t.detail;

        return this;

    },

}

function Chunk(terrain, msgChunk) {

    this.terrain = terrain;

    var chunkedWidth = Math.ceil(terrain.width / terrain.chunkSize);

    var y = Math.floor(msgChunk.Index / chunkedWidth)
    var x = msgChunk.Index - (y * chunkedWidth)

    this.meshX = x * terrain.chunkSize;
    this.meshY = y * terrain.chunkSize;


    var size = terrain.chunkSize * terrain.chunkSize;
    this.tiles = new Array(size);
    for (var i = 0; i < size; i++) {
        this.tiles[i] = new Tile(msgChunk.Map[i].Ground, msgChunk.Map[i].Block, msgChunk.Map[i].Detail);
    }

    this.calcMesh();

}

Chunk.prototype = {

    constructor: Chunk,

    calcMesh: function () {

        // Ландшафт
        var geoLandscape = new THREE.Geometry();
        geoLandscape.vertices = this.terrain.verticesBuffer;

        // Детали
        var geoDetails = new THREE.Geometry();


        // quad добавляет в геометрию квадрат по 4 индексам вершин
        function quad(geo, atlas, tile, v0, v1, v2, v3) {

            // Создаем 2 треугольника
            geo.faces.push(new THREE.Face3(v0, v2, v1));
            geo.faces.push(new THREE.Face3(v2, v3, v1));
            // Задаем текстурные координаты
            geo.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][0]);
            geo.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][1]);

        }

        // detail добавляет в геометрию деталь (два перпендикулярных квадрата)
        function detail(geo, atlas, tile, x, y) {

            var geoDec = new THREE.Geometry();
            // Заполняем вершинный буфер
            geoDec.vertices.push(new THREE.Vector3(-0.5, 0, 1));
            geoDec.vertices.push(new THREE.Vector3(0.5, 0, 1));
            geoDec.vertices.push(new THREE.Vector3(-0.5, 0, 0));
            geoDec.vertices.push(new THREE.Vector3(0.5, 0, 0));

            // Создаем первую плоскость
            quad(geoDec, atlas, tile, 0, 1, 2, 3);

            // Добавляем вторую плоскость, перпендикулярную первой
            geoDec.merge(geoDec.clone(), new THREE.Matrix4().makeRotationZ(Math.PI / 2));

            // Перемещаем
            var mt = new THREE.Matrix4().makeTranslation(x, y, 0);
            // Масштабируем
            var scale = Math.random() * (1 - 0.7) + 0.7;
            var ms = new THREE.Matrix4().makeScale(scale, scale, scale);
            // Крутим
            var mr = new THREE.Matrix4().makeRotationZ(Math.random() * (Math.PI / 2));
            // Формируем матрицу трансформации
            var m = new THREE.Matrix4().multiplyMatrices(mt, ms);
            m.multiply(mr);

            // Мержим деталь с геометрией
            geo.merge(geoDec, m);
        }

        var offset = this.terrain.verticesTopOffset;

        // Перебираем все тайлы чанка (от левого нижнего угла направо и вверх)
        for (var y = 0; y < this.terrain.chunkSize; y++) {

            // Вычисляем смещения индексов вершин
            var yb = y * (this.terrain.chunkSize + 1);
            var yt = yb + this.terrain.chunkSize + 1;

            for (var x = 0; x < this.terrain.chunkSize; x++) {

                // Индекс текущего тайла
                var index = x + y * this.terrain.chunkSize;

                // Вычисляем индексы 4 нижних точек тайла
                //
                //   0  *---*  1
                //      |   |
                //   2  *---*  3

                var i0 = yt + x;
                var i1 = yt + x + 1;
                var i2 = yb + x;
                var i3 = yb + x + 1;

                // Поверхность
                if (this.tiles[index].ground != 0) {
                    quad(geoLandscape, this.terrain.atlas, this.terrain.grounds[this.tiles[index].ground], i0, i1, i2, i3);
                }

                // Деталь
                if (this.tiles[index].detail != 0) {
                    detail(geoDetails, this.terrain.atlas, this.terrain.details[this.tiles[index].detail], x, y);
                };


                // Блочный тайл
                if (this.tiles[index].block != 0) {

                    // Южная сторона
                    quad(geoLandscape, this.terrain.atlas, this.terrain.blocks[this.tiles[index].block][0], i2 + offset, i3 + offset, i2, i3);
                    // Восточная сторона
                    quad(geoLandscape, this.terrain.atlas, this.terrain.blocks[this.tiles[index].block][0], i3 + offset, i1 + offset, i3, i1);
                    // Северная сторона
                    quad(geoLandscape, this.terrain.atlas, this.terrain.blocks[this.tiles[index].block][0], i1 + offset, i0 + offset, i1, i0);
                    // Западная сторона
                    quad(geoLandscape, this.terrain.atlas, this.terrain.blocks[this.tiles[index].block][0], i0 + offset, i2 + offset, i0, i2);
                    // Верхушка
                    quad(geoLandscape, this.terrain.atlas, this.terrain.blocks[this.tiles[index].block][1], i0 + offset, i1 + offset, i2 + offset, i3 + offset);
                }
            }
        }

        this.meshMap = new THREE.Mesh(geoLandscape, this.terrain.atlas.opaqueMaterial);
        this.meshMap.position.set(this.meshX, this.meshY, 0);

        //this.scene.add(this.meshMap);

        this.meshDetails = new THREE.Mesh(geoDetails, this.terrain.atlas.transMaterial);
        this.meshDetails.position.set(this.meshX + 0.5, this.meshY + 0.5, 0);

        //this.scene.add(this.meshDetails);


    },

}

function Terrain(width, height, chunkSize, atlas) {

    this.width = width;
    this.height = height;
    this.chunkSize = chunkSize;
    this.atlas = atlas;

    this.chunks = [];

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

Terrain.prototype = {

    constructor: Terrain,

    setChunk: function (msgChunk) {

        this.chunks[msgChunk.Index] = new Chunk(this, msgChunk);

    },


}


export { Terrain, Chunk };