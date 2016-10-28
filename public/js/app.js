
if (!Detector.webgl) Detector.addGetWebGLMessage();

var renderer, scene, camera, stats;

var meshChar, meshEchoChar;

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var camHeight = 14;
var camMotion = 0;

var log, player, ticker, connect, controller;


log = new Log();

Player = function () {

	this.speed = 100;
	this.position = new THREE.Vector3(0, 0, 0.5);
	this.motion = new THREE.Vector3();
	this.angle = 0;
	this.slew = 0;

}

player = new Player();

Connect = function (ping) {

	this.addPing = ping;

	if (window["WebSocket"]) {

		var connect = this;

		this.connected = false;

		this.ws = new WebSocket("ws://" + window.location.host + "/ws");

		this.ws.onopen = function () {
			connect.connected = true;
			log.appendText("[WS] Соединение установлено.");
		};

		this.ws.onerror = function (error) {
			log.appendText("[WS] Ошибка: " + error.message);
		};

		this.ws.onclose = function (event) {
			connect.connected = false;
			var text = "[WS] ";
			if (event.wasClean) {
				text += 'Соединение закрыто чисто.';
			} else {
				text += 'Обрыв соединения.';
			}
			// http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
			text += 'Код: ' + event.code;
			log.appendText(text);
		};

		this.ws.onmessage = function (evt) {
			var msg = JSON.parse(evt.data);
//		log.appendText(JSON.stringify(this.rotation));
//		log.appendText(evt.data);
			meshEchoChar.position.x = msg.Position[0];
			meshEchoChar.position.y = msg.Position[1];
			var echoQuat = new THREE.Quaternion();
			echoQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), msg.Angle);
			meshEchoChar.rotation.setFromQuaternion(echoQuat, 'XYZ');

		};

		this.send = function (msg) {
			if (this.connected) {
				if (this.addPing > 0) {
//					setTimeout(function () { connect.ws.send(msg); }, Math.floor(Math.random() * connect.addPing));
					setTimeout(function () { connect.ws.send(msg); }, connect.addPing);
				} else {
					this.ws.send(msg);
				}
			}
		};

	} else {
		log.appendText("[WS] Браузер не поддерживает WebSockets.");
	}
};

connect = new Connect(100);

Controller = function (dom) {

	this.dom = dom;

	this.moveForward = false;
	this.moveBackward = false;

	this.moveLeft = false;
	this.moveRight = false;

	this.rotateLeft = false;
	this.rotateRight = false;

	this.zoomIn = false;
	this.zoomOut = false;

	this.modifiers = { shift: false, ctrl: false, alt: false, meta: false };

	this.onKeyChange = function (event, pressed) {

		switch (event.keyCode) {

			// https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

			case 87: /*W*/ this.moveForward = pressed; break;
			case 83: /*S*/ this.moveBackward = pressed; break;

			case 65: /*A*/ this.moveLeft = pressed; break;
			case 68: /*D*/ this.moveRight = pressed; break;

			case 81: /*Q*/ this.rotateLeft = pressed; break;
			case 69: /*E*/ this.rotateRight = pressed; break;

			case 33: /*PageUp*/ this.zoomIn = pressed; break;
			case 34: /*PageDown*/ this.zoomOut = pressed; break;

		};

		this.modifiers.shift = event.shiftKey;
		this.modifiers.ctrl = event.ctrlKey;
		this.modifiers.alt = event.altKey;
		this.modifiers.meta = event.metaKey;

	};

	this.dispose = function () {
		this.dom.removeEventListener('contextmenu', contextmenu, false);
		window.removeEventListener('keydown', _onKeyDown, false);
		window.removeEventListener('keyup', _onKeyUp, false);
	}

	/*
		var _onKeyDown = bind(this, this.onKeyDown);
		var _onKeyUp = bind(this, this.onKeyUp);
		function bind(scope, fn) {
			return function () {
				fn.apply(scope, arguments);
			};
		};
	*/

	function contextmenu(event) {
		event.preventDefault();
	}

	var controller = this;
	var _onKeyDown = function (event) { controller.onKeyChange(event, true); };
	var _onKeyUp = function (event) { controller.onKeyChange(event, false); };

	this.dom.addEventListener('contextmenu', contextmenu, false);

	window.addEventListener('keydown', _onKeyDown, false);
	window.addEventListener('keyup', _onKeyUp, false);

};


Ticker = function (amplitude) {
	this.current = 0;
	this.time = new Date().getTime();
	this.amplitude = amplitude;
	this.interval = 1000 / this.amplitude;

	ticker = this;

	this.tick = function () {

		// Увеличиваем номер текущего тика
		ticker.current += 1;
		// Обновляем момент начала текущего тика
		ticker.time = new Date().getTime();

		// Изменяем параметры в соответствии с приращениями прошлого тика
		player.position.add(player.motion);
		player.angle += player.slew;
		camHeight += camMotion;

		// Обнуляем приращения
		player.motion.set(0, 0, 0);
		player.slew = 0;
		camMotion = 0;

		// Рассчитываем единичный вектор движения прямо
		var forwardDirection = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), player.angle);

		// Расчитываем единичный вектор стрейфа направо 
		var rightDirection = new THREE.Vector3().copy(forwardDirection);
		rightDirection.applyAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI / 2);

		// Обрабатываем показания контроллера и задаем приращения текущего тика
		if (controller.rotateLeft) {
			player.slew += player.speed / 50 / ticker.amplitude;
		}

		if (controller.rotateRight) {
			player.slew -= player.speed / 50 / ticker.amplitude;
		}

		if (controller.moveRight) {
			player.motion.add(rightDirection);
		}

		if (controller.moveLeft) {
			player.motion.sub(rightDirection);
		}

		if (controller.moveForward) {
			player.motion.add(forwardDirection);
		};

		if (controller.moveBackward) {
			player.motion.sub(forwardDirection);
		}

		if (controller.zoomIn) {
			camMotion -= 0.5;
		}

		if (controller.zoomOut) {
			camMotion += 0.5;
		}

		// Формируем вектор движения
		player.motion.normalize();
		// скорость = количество тайлов в секунду * 10
		player.motion.multiplyScalar( player.speed / 10 / ticker.amplitude );
		if (controller.modifiers.shift) {
			player.motion.multiplyScalar( 0.25 );
			player.slew *= 0.25;
			camMotion *= 0.25;
		}


		// Формируем сообщение на сервер
		var msg = {
			header: {
				time: new Date().getTime(),
				tick: ticker.current,
				type: "controller"
			},
			data: controller
		};
		// И отправляем его
		connect.send(JSON.stringify(msg));

	}

	this.id = setInterval(this.tick, this.interval);

}

init();

animate();


function init() {

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x111111);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);

	controller = new Controller(renderer.domElement);
	ticker = new Ticker(20);
	camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 1, 1 * 200);
	camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);
	scene = new THREE.Scene();

	//				scene.fog = new THREE.Fog( 0xaaaaff, 1*18, 1*24 );

	var atlas = {};
	atlas.Cols = 16;
	atlas.Rows = 16;
	atlas.TileSize = 32;
	atlas.Uoff = 1 / atlas.Cols / (atlas.TileSize + 2);
	atlas.Voff = 1 / atlas.Rows / (atlas.TileSize + 2);


	var canvas = document.createElement("canvas");
	canvas.width = atlas.Cols * (atlas.TileSize + 2);
	canvas.height = atlas.Rows * (atlas.TileSize + 2);
	var ctx = canvas.getContext('2d');

	var canvasMap = new THREE.Texture(canvas);
	canvasMap.magFilter = THREE.NearestFilter;
	canvasMap.minFilter = THREE.NearestFilter;
	canvasMap.flipY = false;

	var img = new Image();
	img.onload = function () {
		for (var y = 0; y < atlas.Rows; y++) {
			for (var x = 0; x < atlas.Cols; x++) {

				var sx = x * atlas.TileSize;
				var sy = y * atlas.TileSize;
				var dx = x * (atlas.TileSize + 2);
				var dy = y * (atlas.TileSize + 2);

				ctx.drawImage(img, sx, sy, atlas.TileSize, atlas.TileSize, dx + 1, dy + 1, atlas.TileSize, atlas.TileSize);

				ctx.drawImage(img, sx, sy, 1, atlas.TileSize, dx, dy + 1, 1, atlas.TileSize);
				ctx.drawImage(img, sx + atlas.TileSize - 1, sy, 1, atlas.TileSize, dx + atlas.TileSize + 1, dy + 1, 1, atlas.TileSize);

				ctx.drawImage(img, sx, sy, atlas.TileSize, 1, dx + 1, dy, atlas.TileSize, 1);
				ctx.drawImage(img, sx, sy + atlas.TileSize - 1, atlas.TileSize, 1, dx + 1, dy + atlas.TileSize + 1, atlas.TileSize, 1);

			};
		};
		canvasMap.needsUpdate = true;
	};
	img.src = 'textures/atlas.png';

	atlas.Tiles = [];

	for (var i = 0; i < atlas.Cols * atlas.Rows; i++) {

		var v = Math.floor(i / atlas.Cols)
		var u = i - (v * atlas.Cols)

		/*
			красный		0        1
						*---------*		зеленый
						|         |
						|    ^    |
						|         |
			синий   	*---------*		желтый
						3        2

			1: 3-0-2
			2: 0-1-2
		*/

		var tile = {};

		tile.UVs = [
			new THREE.Vector2(u / atlas.Cols + atlas.Uoff, (v + 1) / atlas.Rows - atlas.Voff),
			new THREE.Vector2((u + 1) / atlas.Cols - atlas.Uoff, (v + 1) / atlas.Rows - atlas.Voff),
			new THREE.Vector2((u + 1) / atlas.Cols - atlas.Uoff, v / atlas.Rows + atlas.Voff),
			new THREE.Vector2(u / atlas.Cols + atlas.Uoff, v / atlas.Rows + atlas.Voff)
		];

		tile.Faces = [];

		tile.Faces.push([
			[tile.UVs[3], tile.UVs[0], tile.UVs[2]],
			[tile.UVs[0], tile.UVs[1], tile.UVs[2]]]);

		tile.Faces.push([
			[tile.UVs[2], tile.UVs[3], tile.UVs[1]],
			[tile.UVs[3], tile.UVs[0], tile.UVs[1]]]);

		tile.Faces.push([
			[tile.UVs[1], tile.UVs[2], tile.UVs[0]],
			[tile.UVs[2], tile.UVs[3], tile.UVs[0]]]);

		tile.Faces.push([
			[tile.UVs[0], tile.UVs[1], tile.UVs[3]],
			[tile.UVs[1], tile.UVs[2], tile.UVs[3]]]);

		atlas.Tiles.push(tile);
	}

	var atlasMap = new THREE.MeshBasicMaterial({ map: canvasMap });

	var transMaterial = new THREE.MeshBasicMaterial({ map: canvasMap });
	transMaterial.transparent = true;
	transMaterial.opacity = 0.8;
	transMaterial.side = THREE.DoubleSide;

	// Map
	/*
	var geometryMap = new THREE.PlaneGeometry( 1*16, 1*16, 16, 16 );
	geometryMap.faceVertexUvs = [[]];
	for (var i = 0; i < 256; i++) {
		geometryMap.faceVertexUvs[0].push( atlas.Tiles[i].Faces[0][0] );
		geometryMap.faceVertexUvs[0].push( atlas.Tiles[i].Faces[0][1] );
	}
	*/

	var mapSize = 64;
	//				var br = [0,0,0,0,17,18,19,48,53,78,133,126,142];
	var br = [0, 0, 0, 0, 17, 19, 53, 53, 78, 126, 142];
	var geometryMap = new THREE.PlaneGeometry(mapSize, mapSize, mapSize, mapSize);

	geometryMap.faceVertexUvs = [[]];
	for (var i = 0; i < mapSize * mapSize; i++) {

		var s = Math.floor(Math.random() * (br.length));
		geometryMap.faceVertexUvs[0].push(atlas.Tiles[br[s]].Faces[0][0]);
		geometryMap.faceVertexUvs[0].push(atlas.Tiles[br[s]].Faces[0][1]);
	}

	var meshMap = new THREE.Mesh(geometryMap, atlasMap);
	scene.add(meshMap);

	// Cube

	//		var materials = [
	//    		leftSide,        // 0 - Left side
	//    		rightSide,       // 1 - Right side
	//    		topSide,         // 2 - Top side
	//    		bottomSide,      // 3 - Bottom side
	//		    frontSide,       // 4 - Front side
	//    		backSide         // 5 - Back side
	//		];

	// подготавливаем меш для пенька
	var geometryCube = new THREE.BoxGeometry(1, 1, 1);
	var faceTop = 21;
	var faceWall = 20;
	geometryCube.faceVertexUvs = [[]];
	for (var i = 0; i < 6; i++) {
		geometryCube.faceVertexUvs[0].push(atlas.Tiles[faceWall].Faces[0][0]); //231+i
		geometryCube.faceVertexUvs[0].push(atlas.Tiles[faceWall].Faces[0][1]);
	}
	geometryCube.faceVertexUvs[0][2 * 2] = atlas.Tiles[faceTop].Faces[0][0];
	geometryCube.faceVertexUvs[0][2 * 2 + 1] = atlas.Tiles[faceTop].Faces[0][1];

	var meshCube = new THREE.Mesh(geometryCube, atlasMap);
	meshCube.rotation.x = Math.PI / 2;

	// добавляем пеньки
	for (var i = 0; i < mapSize * mapSize / 16; i++) {
		var x = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
		var y = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
		meshCube.position.set(x + 0.5, y + 0.5, 0.5);
		scene.add(meshCube.clone());
	}

	// Tex
	var geometryTex = new THREE.PlaneGeometry(2 * 3, 2 * 3, 1, 1);
	meshTex = new THREE.Mesh(geometryTex, atlasMap);
	meshTex.position.set(8, 0, 1);
	//scene.add( meshTex );

	// Player
	var playerSize = 2/3;
	var geometryChar = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
	meshChar = new THREE.Mesh(geometryChar, atlasMap);
	geometryChar.faceVertexUvs = [[]];
	for (var i = 0; i < 6; i++) {
		geometryChar.faceVertexUvs[0].push(atlas.Tiles[216].Faces[0][0]);
		geometryChar.faceVertexUvs[0].push(atlas.Tiles[216].Faces[0][1]);
	}
	//meshChar.visible = false;
	scene.add(meshChar);

	// echoChar
	var geometryEchoChar = new THREE.PlaneGeometry(1, 1, 1, 1);
	geometryEchoChar.faceVertexUvs = [[]];
	geometryEchoChar.faceVertexUvs[0].push(atlas.Tiles[220].Faces[0][0]);
	geometryEchoChar.faceVertexUvs[0].push(atlas.Tiles[220].Faces[0][1]);
	meshEchoChar = new THREE.Mesh(geometryEchoChar, transMaterial);

	meshEchoChar.position.set(0, 0, 0.01);
	scene.add(meshEchoChar);

	// Dec
	var geometryDec = new THREE.PlaneGeometry(1, 1, 1, 1);
	geometryDec.faceVertexUvs = [[]];
	geometryDec.faceVertexUvs[0].push(atlas.Tiles[90].Faces[0][0]);  //89
	geometryDec.faceVertexUvs[0].push(atlas.Tiles[90].Faces[0][1]);
	meshDec = new THREE.Mesh(geometryDec, transMaterial);
	meshDec.rotation.x = Math.PI / 2;

	meshDec.position.set(2.5, 2, 0.5);
	var count = 4;
	for (var i = 0; i < count; i++) {
		meshDec.position.y = 2 + i / count + 1 / count / 2;
		scene.add(meshDec.clone());
	}

	scene.add(meshDec);

	/*
	var axisHelper = new THREE.AxisHelper( 50 );
	scene.add( axisHelper );
	
	edges = new THREE.FaceNormalsHelper( meshCube, 2, 0x00ff00, 1 );
	scene.add( edges );
	
	// вектор направления куба
	var matrix = new THREE.Matrix4();
	matrix.extractRotation( meshCube.matrix );
	var dir = new THREE.Vector3( 0, 0, 1 );
	dir = matrix.multiplyVector3( dir );
	var origin = meshCube.position.clone();
	var length = 2*1;
	var hex = 0xffff00;
	var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
	scene.add( arrowHelper );
	*/

	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	container.appendChild(log.dom);

	//
	var debug = document.getElementById('info');

	window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);

	render();
	stats.update();
}

function render() {

	// Вычисляем время, прошедшее после начала тика
	var delta = new Date().getTime() - ticker.time;
	// Чем больше времени прошло, тем больше множитель (0 -> 1)
	var scalar = delta / ticker.interval;

	// Рассчитываем позицию игрока в этом фрейме
	var motion = new THREE.Vector3().copy(player.motion);
	motion.multiplyScalar(scalar);
	var position = new THREE.Vector3().copy(player.position).add(motion);
	// Рассчитываем угол направления в этом фрейме
	var rotation = player.angle + player.slew * scalar;
	// Рассчитываем вектор направления в этом фрейме
	var direction = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), rotation);
	// Рассчитываем высоту камеры в этом фрейме
	var height = camHeight + camMotion*scalar;
	
	// Перемещаем меш игрока
	meshChar.position.copy(position);

	// Перемещаем камеру
	var camDistance = height / -2;
	var camPos = new THREE.Vector3();
	camPos.addVectors(position, direction.multiplyScalar(camDistance));
	camera.position.set(camPos.x, camPos.y, height);

	// Крутим игрока
	meshChar.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

	// Крутим камеру
	camera.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');
	// И опускаем немного вниз
	camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

	// Скрывать игрока, когда камера приближается к нему слишком близко
	if ( height < 5) {
		meshChar.visible = false;
	} else {
		meshChar.visible = true;
	}

	//	console.log(camera.position);
	//	log.appendText(JSON.stringify(this.rotation));

	renderer.render(scene, camera);

	// статистика рендера
	//				const { render, memory } = renderer.info
	//				stats.textContent = `
	//				calls: ${render.calls}
	//				faces: ${render.faces}
	//				vertices: ${render.vertices}
	//				geometries: ${memory.geometries}`
}
