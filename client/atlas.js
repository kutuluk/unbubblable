function Atlas(cols, rows, size, src) {

	var atlas = this;

	this.cols = cols;
	this.rows = rows;
	this.size = size;

	// Рассчитываем UV-размеры 1 пиксела 
	this.uOff = 1 / this.cols / (this.size + 2);
	this.vOff = 1 / this.rows / (this.size + 2);

	// Создаем канву увеличенного размера
	var canvas = document.createElement("canvas");
	canvas.width = this.cols * (this.size + 2);
	canvas.height = this.rows * (this.size + 2);
	var ctx = canvas.getContext('2d');

	// Создаем текстуру из созданной канвы
	this.texture = new THREE.Texture(canvas);
	this.texture.magFilter = THREE.NearestFilter;
	this.texture.minFilter = THREE.NearestFilter;
	this.texture.flipY = false;

	var img = new Image();

	// Создание новой текстуры начнется после успешной загрузки исходной
	img.onload = function () {

		// Расширяем каждый тайл на 1 пиксел во все стороны
		// и копируем в образовавшееся пространство боковые линии исходного тайла
		//
		//		*---*---*---*---*
		//		|   | ^ | ^ |   |
		//		*---*-|-*-|-*---*
		//		| <-|-X | X-|-> |
		//		|---*---*---*---*
		//		| <-|-X | X-|-> |
		//		|---*-|-*-|-*---*
		//      |   | v | v |   |
		//		*---*---*---*---*
		//

		for (var y = 0; y < atlas.rows; y++) {
			for (var x = 0; x < atlas.cols; x++) {

				// Начальная позиция верхнего левого пиксела тайла в исходной текстуре
				var sx = x * atlas.size;
				var sy = y * atlas.size;
				// Начальная позиция верхнего левого пиксела тайла в новой текстуре
				var dx = x * (atlas.size + 2);
				var dy = y * (atlas.size + 2);

				// Копируем исходный тайл
				ctx.drawImage(img, sx, sy, atlas.size, atlas.size, dx + 1, dy + 1, atlas.size, atlas.size);
				// Копируем левую и правую линии
				ctx.drawImage(img, sx, sy, 1, atlas.size, dx, dy + 1, 1, atlas.size);
				ctx.drawImage(img, sx + atlas.size - 1, sy, 1, atlas.size, dx + atlas.size + 1, dy + 1, 1, atlas.size);
				// Копируем верхнюю и нижнюю линии
				ctx.drawImage(img, sx, sy, atlas.size, 1, dx + 1, dy, atlas.size, 1);
				ctx.drawImage(img, sx, sy + atlas.size - 1, atlas.size, 1, dx + 1, dy + atlas.size + 1, atlas.size, 1);

			};
		};
		// Выставляем флаг необходимости обновления текстуры
		atlas.texture.needsUpdate = true;

	};

	// Загружаем исходную текстуру
	img.src = src;

	this.tiles = [];

	// Перебираем все тайлы атласа
	for (var i = 0; i < this.cols * this.rows; i++) {

		// Рассчитываем координаты текущего тайла
		var v = Math.floor(i / this.cols)
		var u = i - (v * this.cols)

		/*
                        0         1
            красный     *---------*     зеленый
                        |\        |
                        |    ^    |
                        |        \|
            синий       *---------*     желтый
                        2         3

			1 треугольник: 2-0-3
			2 треугольник: 0-1-3
		*/
		/*
                        2         3
            красный     *---------*     зеленый
                        |\        |
                        |    ^    |
                        |        \|
            синий       *---------*     желтый
                        0         1

			1 треугольник: 0-2-1
			2 треугольник: 2-3-1
		*/

		var tile = {};

		// Рассчитываем uv-координаты 4 углов тайла
		tile.uvs = [
			new THREE.Vector2(u / this.cols + this.uOff, (v + 1) / this.rows - this.vOff),
			new THREE.Vector2((u + 1) / this.cols - this.uOff, (v + 1) / this.rows - this.vOff),
			new THREE.Vector2(u / this.cols + this.uOff, v / this.rows + this.vOff),
			new THREE.Vector2((u + 1) / this.cols - this.uOff, v / this.rows + this.vOff),
		];
//		tile.uvs = [
//			new THREE.Vector2(u / this.cols + this.uOff, v / this.rows + this.vOff),
//			new THREE.Vector2((u + 1) / this.cols - this.uOff, v / this.rows + this.vOff),
//			new THREE.Vector2(u / this.cols + this.uOff, (v + 1) / this.rows - this.vOff),
//			new THREE.Vector2((u + 1) / this.cols - this.uOff, (v + 1) / this.rows - this.vOff),
//		];

		// Faces - 4 набора координат, определяющих поворот текстуры 
		tile.faces = [];


		// Изначальное направление текстуры
		tile.faces.push([
			[tile.uvs[2], tile.uvs[0], tile.uvs[3]],
			[tile.uvs[0], tile.uvs[1], tile.uvs[3]]]);
// 0 -> 2
// 1 -> 3
//			[tile.uvs[0], tile.uvs[2], tile.uvs[1]],
//			[tile.uvs[2], tile.uvs[3], tile.uvs[1]]]);

		// Текстура повернута на 90 градусов налево
		tile.faces.push([
			[tile.uvs[3], tile.uvs[2], tile.uvs[1]],
			[tile.uvs[2], tile.uvs[0], tile.uvs[1]]]);

		// Текстура повернута на 180 градусов налево
		tile.faces.push([
			[tile.uvs[1], tile.uvs[3], tile.uvs[0]],
			[tile.uvs[3], tile.uvs[2], tile.uvs[0]]]);

		// Текстура повернута на 270 градусов налево
		tile.faces.push([
			[tile.uvs[0], tile.uvs[1], tile.uvs[2]],
			[tile.uvs[1], tile.uvs[3], tile.uvs[2]]]);

		this.tiles.push(tile);
	};

	// Непрозрачный материал
	this.opaqueMaterial = new THREE.MeshBasicMaterial({ map: this.texture });

	// Прозрачный материал
	this.transMaterial = new THREE.MeshBasicMaterial({ map: this.texture });
	this.transMaterial.transparent = true;
	this.transMaterial.alphaTest = 0.5;
	//	this.transMaterial.opacity = 0.8;
	this.transMaterial.side = THREE.DoubleSide;

};

Atlas.prototype = {

	constructor: Atlas

};

export { Atlas };