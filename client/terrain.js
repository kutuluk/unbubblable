class Chunk {
  constructor(terrain, msgChunk) {
    this.terrain = terrain;

    const y = Math.floor(msgChunk.index / terrain.chunkedWidth);
    const x = msgChunk.index - y * terrain.chunkedWidth;

    this.meshX = x * terrain.chunkSize;
    this.meshY = y * terrain.chunkSize;
    this.tiles = msgChunk.tiles;

    this.calcMesh();
  }

  calcMesh() {
    // Геометрия ландшафта
    const geoLandscape = new THREE.Geometry();
    geoLandscape.vertices = this.terrain.verticesBuffer;

    // Геометрия деталей
    const geoDetails = new THREE.Geometry();

    // quad добавляет в геометрию квадрат по 4 индексам вершин
    const quad = function quad(geo, atlas, tile, v0, v1, v2, v3) {
      // Создаем 2 треугольника
      geo.faces.push(new THREE.Face3(v0, v2, v1));
      geo.faces.push(new THREE.Face3(v2, v3, v1));
      // Задаем текстурные координаты
      geo.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][0]);
      geo.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][1]);
    };

    // detail добавляет в геометрию деталь (два перпендикулярных квадрата)
    const detail = function detail(geo, atlas, tile, x, y) {
      const geoDec = new THREE.Geometry();
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
      const mt = new THREE.Matrix4().makeTranslation(x, y, 0);
      // Масштабируем
      const scale = Math.random() * (1 - 0.7) + 0.7;
      const ms = new THREE.Matrix4().makeScale(scale, scale, scale);
      // Крутим
      const mr = new THREE.Matrix4().makeRotationZ(Math.random() * (Math.PI / 2));
      // Формируем матрицу трансформации
      const m = new THREE.Matrix4().multiplyMatrices(mt, ms);
      m.multiply(mr);

      // Мержим деталь с геометрией
      geo.merge(geoDec, m);
    };

    const offset = this.terrain.verticesTopOffset;

    // Перебираем все тайлы чанка (от левого нижнего угла направо и вверх)
    for (let y = 0; y < this.terrain.chunkSize; y++) {
      // Вычисляем смещения индексов вершин
      const yb = y * (this.terrain.chunkSize + 1);
      const yt = yb + this.terrain.chunkSize + 1;

      for (let x = 0; x < this.terrain.chunkSize; x++) {
        // Индекс текущего тайла
        const index = x + y * this.terrain.chunkSize;

        // Вычисляем индексы 4 нижних точек тайла
        //
        //   0  *---*  1
        //      |   |
        //   2  *---*  3

        const i0 = yt + x;
        const i1 = yt + x + 1;
        const i2 = yb + x;
        const i3 = yb + x + 1;

        // Поверхность
        if (this.tiles[index].ground !== 0) {
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.grounds[this.tiles[index].ground].texture,
            i0,
            i1,
            i2,
            i3,
          );
        }

        // Деталь
        if (this.tiles[index].detail !== 0) {
          detail(
            geoDetails,
            this.terrain.atlas,
            this.terrain.details[this.tiles[index].detail].texture,
            x,
            y,
          );
        }

        // Блок
        if (this.tiles[index].block !== 0) {
          // Южная сторона
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.blocks[this.tiles[index].block].textureWall,
            i2 + offset,
            i3 + offset,
            i2,
            i3,
          );
          // Восточная сторона
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.blocks[this.tiles[index].block].textureWall,
            i3 + offset,
            i1 + offset,
            i3,
            i1,
          );
          // Северная сторона
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.blocks[this.tiles[index].block].textureWall,
            i1 + offset,
            i0 + offset,
            i1,
            i0,
          );
          // Западная сторона
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.blocks[this.tiles[index].block].textureWall,
            i0 + offset,
            i2 + offset,
            i0,
            i2,
          );
          // Верхушка
          quad(
            geoLandscape,
            this.terrain.atlas,
            this.terrain.blocks[this.tiles[index].block].textureTop,
            i0 + offset,
            i1 + offset,
            i2 + offset,
            i3 + offset,
          );
        }
      }
    }

    this.meshLandscape = new THREE.Mesh(geoLandscape, this.terrain.atlas.opaqueMaterial);
    this.meshLandscape.position.set(this.meshX, this.meshY, 0);

    this.meshDetails = new THREE.Mesh(geoDetails, this.terrain.atlas.transMaterial);
    this.meshDetails.position.set(this.meshX + 0.5, this.meshY + 0.5, 0);
  }
}

class Terrain {
  constructor(msgTerrain, atlas) {
    this.width = msgTerrain.width;
    this.height = msgTerrain.height;
    this.chunkSize = msgTerrain.chunkSize;
    this.grounds = msgTerrain.grounds;
    this.blocks = msgTerrain.blocks;
    this.details = msgTerrain.details;
    this.atlas = atlas;

    this.chunkedWidth = Math.floor(this.width / this.chunkSize);
    this.chunkedHeight = Math.floor(this.height / this.chunkSize);

    this.chunks = [];

    // Заполняем общий вершинный буфер для чанков
    this.verticesBuffer = [];
    for (let z = 0; z < 2; z++) {
      for (let y = 0; y <= this.chunkSize; y++) {
        for (let x = 0; x <= this.chunkSize; x++) {
          this.verticesBuffer.push(new THREE.Vector3(x, y, z));
        }
      }
    }
    // Смещение индексов верхних вершин в буфере
    this.verticesTopOffset = (this.chunkSize + 1) * (this.chunkSize + 1);
  }

  setChunk(msgChunk) {
    this.chunks[msgChunk.index] = new Chunk(this, msgChunk);
  }
}

export default Terrain;
