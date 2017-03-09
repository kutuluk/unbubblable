import { log } from './log';

class Atlas {

	constructor(cols, rows, resolution, src) {

		let atlas = this;

		this.cols = cols;
		this.rows = rows;
		this.resolution = resolution;
		this.src = src;

		// Рассчитываем UV-размеры 1 пиксела 
		let uOff = 1 / this.cols / (this.resolution + 2);
		let vOff = 1 / this.rows / (this.resolution + 2);

		// Создаем канву увеличенного размера
		let canvas = document.createElement("canvas");
		canvas.width = this.cols * (this.resolution + 2);
		canvas.height = this.rows * (this.resolution + 2);
		let ctx = canvas.getContext('2d');

		// Создаем текстуру из созданной канвы
		this.texture = new THREE.Texture(canvas);
		this.texture.magFilter = THREE.NearestFilter;
		this.texture.minFilter = THREE.NearestFilter;
		this.texture.flipY = false;

		let img = new Image();

		// Создание атласа начнется после успешной загрузки изображения исходной текстуры
		img.onload = function () {

			// Во избежание появления артефактов на границах тайлов
			// расширяем каждый тайл на 1 пиксел во все стороны
			// и копируем в образовавшееся пространство боковые линии исходного тайла
			//
			//		*---*---*---*---*
			//		|   | ^ | ^ |   |
			//		*---*-|-*-|-*---*
			//		| <-|-X | X-|-> |
			//		|---*---*---*---*
			//		| <-|-X | X-|-> |
			//		|---*-|-*-|-*---*
			//		|   | v | v |   |
			//		*---*---*---*---*
			//

			for (let y = 0; y < atlas.rows; y++) {
				for (let x = 0; x < atlas.cols; x++) {

					// Начальная позиция верхнего левого пиксела тайла в исходной текстуре
					let sx = x * atlas.resolution;
					let sy = y * atlas.resolution;
					// Начальная позиция верхнего левого пиксела тайла в новой текстуре
					let dx = x * (atlas.resolution + 2);
					let dy = y * (atlas.resolution + 2);

					// Копируем исходный тайл
					ctx.drawImage(img, sx, sy, atlas.resolution, atlas.resolution, dx + 1, dy + 1, atlas.resolution, atlas.resolution);
					// Копируем левую и правую линии
					ctx.drawImage(img, sx, sy, 1, atlas.resolution, dx, dy + 1, 1, atlas.resolution);
					ctx.drawImage(img, sx + atlas.resolution - 1, sy, 1, atlas.resolution, dx + atlas.resolution + 1, dy + 1, 1, atlas.resolution);
					// Копируем верхнюю и нижнюю линии
					ctx.drawImage(img, sx, sy, atlas.resolution, 1, dx + 1, dy, atlas.resolution, 1);
					ctx.drawImage(img, sx, sy + atlas.resolution - 1, atlas.resolution, 1, dx + 1, dy + atlas.resolution + 1, atlas.resolution, 1);

				};
			};
			// Выставляем флаг необходимости обновления текстуры
			atlas.texture.needsUpdate = true;

		};

		// Обработчик ошибки загрузки исходного изображения текстуры
		img.onerror = function () {
			log.appendText(`[IMG] Ошибка загрузки файла: ${atlas.src}`);
		};

		// Загружаем исходную текстуру
		img.src = this.src;

		this.tiles = [];

		// Перебираем все тайлы атласа
		for (let i = 0; i < this.cols * this.rows; i++) {

			// Рассчитываем координаты текущего тайла
			let v = Math.floor(i / this.cols)
			let u = i - (v * this.cols)

			/*
							0         1
				красный     *---------*     зеленый
							|        /|
							|    ^    |
							|/        |
				синий       *---------*     желтый
							2         3
	
				Порядок отрисовки тайла по вершинам (counter-clockwise winding order):
	
				http://learnopengl.com/#!Advanced-OpenGL/Face-culling
				https://threejs.org/examples/misc_uv_tests.html
	
					1 треугольник: 0-2-1
					2 треугольник: 2-3-1
	
				Из-за отраженной текстуры порядок uv-координат другой:
	
					1 треугольник: 2-0-3
					2 треугольник: 0-1-3
			*/

			let tile = {};

			// Рассчитываем uv-координаты 4 углов тайла
			tile.uvs = [
				new THREE.Vector2(u / this.cols + uOff, (v + 1) / this.rows - vOff),
				new THREE.Vector2((u + 1) / this.cols - uOff, (v + 1) / this.rows - vOff),
				new THREE.Vector2(u / this.cols + uOff, v / this.rows + vOff),
				new THREE.Vector2((u + 1) / this.cols - uOff, v / this.rows + vOff),
			];

			// 4 набора uv-координат, определяющих разные повороты текстуры 
			tile.faces = [];


			// Изначальное направление текстуры (север)
			tile.faces.push([
				[tile.uvs[2], tile.uvs[0], tile.uvs[3]],
				[tile.uvs[0], tile.uvs[1], tile.uvs[3]]]);

			// Текстура повернута на 90 градусов налево (запад)
			tile.faces.push([
				[tile.uvs[3], tile.uvs[2], tile.uvs[1]],
				[tile.uvs[2], tile.uvs[0], tile.uvs[1]]]);

			// Текстура повернута на 180 градусов налево (юг)
			tile.faces.push([
				[tile.uvs[1], tile.uvs[3], tile.uvs[0]],
				[tile.uvs[3], tile.uvs[2], tile.uvs[0]]]);

			// Текстура повернута на 270 градусов налево (восток)
			tile.faces.push([
				[tile.uvs[0], tile.uvs[1], tile.uvs[2]],
				[tile.uvs[1], tile.uvs[3], tile.uvs[2]]]);

			this.tiles.push(tile);
		};

		// Непрозрачный материал
		this.opaqueMaterial = new THREE.MeshBasicMaterial({ map: this.texture });
		//this.opaqueMaterial.side = THREE.DoubleSide;

		// Прозрачный материал
		this.transMaterial = new THREE.MeshBasicMaterial({ map: this.texture });
		this.transMaterial.transparent = true;
		this.transMaterial.alphaTest = 0.5;
		//	this.transMaterial.opacity = 0.8;
		this.transMaterial.side = THREE.DoubleSide;

	}

};

export { Atlas };