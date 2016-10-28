(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
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
		var v = Math.floor(i / this.cols);
		var u = i - v * this.cols;

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

		// Рассчитываем uv-координаты 4 углов тайла
		tile.uvs = [new THREE.Vector2(u / this.cols + this.uOff, (v + 1) / this.rows - this.vOff), new THREE.Vector2((u + 1) / this.cols - this.uOff, (v + 1) / this.rows - this.vOff), new THREE.Vector2((u + 1) / this.cols - this.uOff, v / this.rows + this.vOff), new THREE.Vector2(u / this.cols + this.uOff, v / this.rows + this.vOff)];

		// Faces - 4 набора координат, определяющих поворот текстуры 
		tile.faces = [];

		// Изначальное направление текстуры
		tile.faces.push([[tile.uvs[3], tile.uvs[0], tile.uvs[2]], [tile.uvs[0], tile.uvs[1], tile.uvs[2]]]);

		// Текстура повернута на 90 градусов направо
		tile.faces.push([[tile.uvs[2], tile.uvs[3], tile.uvs[1]], [tile.uvs[3], tile.uvs[0], tile.uvs[1]]]);

		// Текстура повернута на 180 градусов направо
		tile.faces.push([[tile.uvs[1], tile.uvs[2], tile.uvs[0]], [tile.uvs[2], tile.uvs[3], tile.uvs[0]]]);

		// Текстура повернута на 270 градусов направо
		tile.faces.push([[tile.uvs[0], tile.uvs[1], tile.uvs[3]], [tile.uvs[1], tile.uvs[2], tile.uvs[3]]]);

		this.tiles.push(tile);
	};

	// Непрозрачный материал
	this.opaqueMaterial = new THREE.MeshBasicMaterial({ map: this.texture });

	// Прозрачный материал
	this.transMaterial = new THREE.MeshBasicMaterial({ map: this.texture });
	this.transMaterial.transparent = true;
	//	this.transMaterial.opacity = 0.8;
	this.transMaterial.side = THREE.DoubleSide;
};

Atlas.prototype = {

	constructor: Atlas

};

exports.Atlas = Atlas;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Connect = undefined;

var _log = require("./log");

//var myProtocol = require('./proto/protocol_pb');
//var protobuf = proto.protocol;

function Connect(delay, game) {

    this.delay = delay || 0;
    this.game = game;
    this.proto = dcodeIO.ProtoBuf.loadProtoFile("./js/protocol.proto").build("protocol");

    //    this.connected = false;
    var connect = this;

    if (window["WebSocket"]) {

        this.ws = new WebSocket("ws://" + window.location.host + "/ws");
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = function () {
            //            connect.connected = true;
            _log.log.appendText("[WS] Соединение установлено.");
        };

        this.ws.onerror = function (error) {
            _log.log.appendText("[WS] Ошибка: " + error.message);
        };

        this.ws.onclose = function (event) {
            //            connect.connected = false;
            var text = "[WS] ";
            if (event.wasClean) {
                text += 'Соединение закрыто чисто.';
            } else {
                text += 'Обрыв соединения.';
            }
            // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
            text += 'Код: ' + event.code;
            _log.log.appendText(text);
        };

        this.ws.onmessage = function (evt) {
            /*
            var msg = JSON.parse(evt.data);
            game.echo.next.position.x = msg.Position[0];
            game.echo.next.position.y = msg.Position[1];
            game.echo.next.position.z = msg.Position[2];
            game.echo.next.motion.x = msg.Motion[0];
            game.echo.next.motion.y = msg.Motion[1];
            game.echo.next.motion.z = msg.Motion[2];
            game.echo.next.angle = msg.Angle;
            game.echo.next.slew = msg.Slew;
            */
            try {
                // Decode the Message
                var msg = connect.proto.PlayerPosition.decode(evt.data);

                game.echo.next.position.x = msg.Position.X;
                game.echo.next.position.y = msg.Position.Y;
                game.echo.next.position.z = msg.Position.Z;
                game.echo.next.motion.x = msg.Motion.X;
                game.echo.next.motion.y = msg.Motion.Y;
                game.echo.next.motion.z = msg.Motion.Z;
                game.echo.next.angle = msg.Angle;
                game.echo.next.slew = msg.Slew;

                //            log.appendText("[PROTO READ: ] " +JSON.stringify(msg));
            } catch (err) {
                _log.log.appendText("[PROTO READ error: ] " + err);
            }
        };
    } else {
        _log.log.appendText("[WS] Браузер не поддерживает WebSockets.");
    }
}

Connect.prototype = {

    constructor: Connect,

    sendMessage: function sendMessage(msg) {
        if (this.ws.readyState == WebSocket.OPEN) {
            //        if (this.connected) {
            if (this.delay > 0) {
                var connect = this;
                setTimeout(function () {
                    connect.ws.send(msg);
                }, this.delay + Math.floor(Math.random() * this.delay / 10) - Math.floor(this.delay / 20));
            } else {
                this.ws.send(msg);
            }
        }
    },

    sendController: function sendController(controller) {
        if (this.ws.readyState == WebSocket.OPEN) {

            //        var ProtoBuf = dcodeIO.ProtoBuf;
            //        var builder = ProtoBuf.loadProtoFile("./js/protocol.proto");
            //        var Proto = builder.build("protocol");

            // Формируем сообщение на сервер
            var msg = new this.proto.Controller(controller.moveForward, controller.moveBackward, controller.moveLeft, controller.moveRight, controller.rotateLeft, controller.rotateRight, new this.proto.Controller.Modifiers(controller.modifiers.shift, controller.modifiers.ctrl, controller.modifiers.alt, controller.modifiers.meta));

            this.ws.send(msg.toArrayBuffer());
        }
    }

};

exports.Connect = Connect;

},{"./log":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function Controller(dom) {

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

    function contextmenu(event) {
        event.preventDefault();
    }

    var controller = this;
    var _onKeyDown = function _onKeyDown(event) {
        controller.onKeyChange(event, true);
    };
    var _onKeyUp = function _onKeyUp(event) {
        controller.onKeyChange(event, false);
    };

    this.dom.addEventListener('contextmenu', contextmenu, false);
    window.addEventListener('keydown', _onKeyDown, false);
    window.addEventListener('keyup', _onKeyUp, false);
}

Controller.prototype = {

    constructor: Controller,

    onKeyChange: function onKeyChange(event, pressed) {

        switch (event.keyCode) {

            // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

            case 87:
                this.moveForward = pressed;break; // W
            case 83:
                this.moveBackward = pressed;break; // S

            case 65:
                this.moveLeft = pressed;break; // A
            case 68:
                this.moveRight = pressed;break; // D

            case 81:
                this.rotateLeft = pressed;break; // Q
            case 69:
                this.rotateRight = pressed;break; // E

            case 33:
                this.zoomIn = pressed;break; // PageUp
            case 34:
                this.zoomOut = pressed;break; // PageDown

        };

        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey;
        this.modifiers.alt = event.altKey;
        this.modifiers.meta = event.metaKey;
    },

    dispose: function dispose() {
        this.dom.removeEventListener('contextmenu', contextmenu, false);
        window.removeEventListener('keydown', _onKeyDown, false);
        window.removeEventListener('keyup', _onKeyUp, false);
    }

};

exports.Controller = Controller;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.game = undefined;

var _log = require('./log');

var _controller = require('./controller');

var _unit = require('./unit');

var _player = require('./player');

var _atlas = require('./atlas');

var _loop = require('./loop');

var _connect = require('./connect');

function Game() {

    this.playable = false;

    // Проверяем поддержку WebGL
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        _log.log.appendText("[RENDERER] Браузер не поддерживает WebGL.");
        return;
    };

    // Проверяем поддержку WebSockets
    if (!window["WebSocket"]) {
        _log.log.appendText("[WS] Браузер не поддерживает WebSockets.");
        return;
    };

    this.playable = true;
    var game = this;

    this.screen = {};
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    this.screen.container = document.getElementById('container');

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x111111);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera = new THREE.PerspectiveCamera(40, this.screen.width / this.screen.height, 1, 1 * 200);
    this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

    this.scene = new THREE.Scene();
    //	this.scene.fog = new THREE.Fog( 0xaaaaff, 1*18, 1*24 );

    var atlas = new _atlas.Atlas(16, 16, 32, 'textures/atlas.png');

    this.controller = new _controller.Controller(this.renderer.domElement);

    this.stats = new Stats();

    this.screen.container.appendChild(this.renderer.domElement);
    this.screen.container.appendChild(this.stats.domElement);
    this.screen.container.appendChild(_log.log.domElement);

    //    this.player = new Player(this.camera, createPlayerMesh());
    this.player = new _player.Player(this.camera, createEchoMesh(219));
    this.echo = new _unit.Unit(createEchoMesh(220));
    createTerrain();
    createDecole(2.5, 2, 0.5);
    //    createTexture();

    this.connect = new _connect.Connect(0, this);

    // Персонаж
    function createPlayerMesh() {
        var playerSize = 2 / 3;
        var geometryChar = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
        var meshPlayer = new THREE.Mesh(geometryChar, atlas.opaqueMaterial);
        geometryChar.faceVertexUvs = [[]];
        for (var i = 0; i < 6; i++) {
            geometryChar.faceVertexUvs[0].push(atlas.tiles[217].faces[0][0]);
            geometryChar.faceVertexUvs[0].push(atlas.tiles[217].faces[0][1]);
        }
        game.scene.add(meshPlayer);

        return meshPlayer;
    };

    // Эхо персонажа
    function createEchoMesh(tile) {
        var geometryEcho = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometryEcho.faceVertexUvs = [[]];
        geometryEcho.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][0]);
        geometryEcho.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][1]);
        var meshEcho = new THREE.Mesh(geometryEcho, atlas.transMaterial);
        game.scene.add(meshEcho);

        return meshEcho;
    };

    // Текстура
    function createTexture() {
        var geometryTex = new THREE.PlaneGeometry(8, 8, 1, 1);
        var meshTex = new THREE.Mesh(geometryTex, atlas.transMaterial);
        meshTex.position.set(10, 0, 1.5);
        game.scene.add(meshTex);
    }

    // Местность
    function createTerrain() {
        var mapSize = 64;
        var br = [0, 0, 0, 0, 17, 19, 53, 53, 78, 126, 142];

        var geometryMap = new THREE.PlaneGeometry(mapSize, mapSize, mapSize, mapSize);
        geometryMap.faceVertexUvs = [[]];
        for (var i = 0; i < mapSize * mapSize; i++) {
            var s = Math.floor(Math.random() * br.length);
            geometryMap.faceVertexUvs[0].push(atlas.tiles[br[s]].faces[0][0]);
            geometryMap.faceVertexUvs[0].push(atlas.tiles[br[s]].faces[0][1]);
        }
        var meshMap = new THREE.Mesh(geometryMap, atlas.opaqueMaterial);
        game.scene.add(meshMap);

        // Пеньки
        //		var materials = [
        //    		leftSide,        // 0 - Left side
        //    		rightSide,       // 1 - Right side
        //    		topSide,         // 2 - Top side
        //    		bottomSide,      // 3 - Bottom side
        //		    frontSide,       // 4 - Front side
        //    		backSide         // 5 - Back side
        //		];

        // Подготавливаем меш для пенька
        var geometryCube = new THREE.BoxGeometry(1, 1, 1);
        var faceTop = 21;
        var faceWall = 20;
        geometryCube.faceVertexUvs = [[]];
        for (var i = 0; i < 6; i++) {
            geometryCube.faceVertexUvs[0].push(atlas.tiles[faceWall].faces[0][0]); //231+i
            geometryCube.faceVertexUvs[0].push(atlas.tiles[faceWall].faces[0][1]);
        }
        geometryCube.faceVertexUvs[0][2 * 2] = atlas.tiles[faceTop].faces[0][0];
        geometryCube.faceVertexUvs[0][2 * 2 + 1] = atlas.tiles[faceTop].faces[0][1];

        var meshCube = new THREE.Mesh(geometryCube, atlas.opaqueMaterial);
        meshCube.rotation.x = Math.PI / 2;

        // Рассаживаем пеньки
        for (var i = 0; i < mapSize * mapSize / 16; i++) {
            var x = Math.floor(Math.random() * mapSize) - Math.floor(mapSize / 2);
            var y = Math.floor(Math.random() * mapSize) - Math.floor(mapSize / 2);
            meshCube.position.set(x + 0.5, y + 0.5, 0.5);
            game.scene.add(meshCube.clone());
        };
    };

    // Травка
    function createDecole(x, y, z) {
        var geometryDec = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometryDec.faceVertexUvs = [[]];
        geometryDec.faceVertexUvs[0].push(atlas.tiles[13].faces[0][0]); //89 //90
        geometryDec.faceVertexUvs[0].push(atlas.tiles[13].faces[0][1]);
        var meshDec = new THREE.Mesh(geometryDec, atlas.transMaterial);
        meshDec.rotation.x = Math.PI / 2;

        meshDec.position.set(x, y, z);
        var count = 4;
        for (var i = 0; i < count; i++) {
            meshDec.position.y = y + i / count + 1 / count / 2;
            game.scene.add(meshDec.clone());
        }

        game.scene.add(meshDec);
    }

    this.loop = new _loop.Loop(this, 20);

    var _onWindowResize = bind(this, this.onWindowResize);
    window.addEventListener('resize', _onWindowResize, false);

    function bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    };
}

Game.prototype = {

    constructor: Game,

    onWindowResize: function onWindowResize() {
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.camera.aspect = this.screen.width / this.screen.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screen.width, this.screen.height);
    },

    animate: function animate() {
        requestAnimationFrame(game.animate);
        game.render();
        game.stats.update();
    },

    render: function render() {
        if (!this.loop.updating) {

            // Вычисляем время, прошедшее после начала тика
            var delta = new Date().getTime() - this.loop.time;
            // Чем больше времени прошло, тем больше множитель (0 -> 1)
            var frame = delta / this.loop.interval;

            this.player.animate(frame);
            this.echo.animate(frame);
            this.echo.mesh.position.z = 0.01;

            //	console.log(camera.position);
            //	log.appendText(JSON.stringify(this.rotation));

            this.renderer.render(this.scene, this.camera);

            // статистика рендера
            //				const { render, memory } = renderer.info
            //				stats.textContent = `
            //				calls: ${render.calls}
            //				faces: ${render.faces}
            //				vertices: ${render.vertices}
            //				geometries: ${memory.geometries}`
        }
    }

};

var game = new Game();

exports.game = game;

},{"./atlas":1,"./connect":2,"./controller":3,"./log":5,"./loop":6,"./player":8,"./unit":9}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function Log() {

	this.domElement = document.createElement("div");

	//this.dom.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.domElement.style.margin = "0";
	this.domElement.style.textAlign = "left";
	this.domElement.style.padding = "0.5em 0.5em 0.5em 0.5em";
	this.domElement.style.position = "absolute";
	this.domElement.style.left = "1em";
	this.domElement.style.width = "30em";
	this.domElement.style.height = "10em";
	this.domElement.style.bottom = "1em";
	this.domElement.style.overflow = "auto";
	//				this.dom.style.font = "normal 16px Fixedsys";
	this.domElement.style.font = "normal 16px sans-serif";
	//				this.dom.style.textShadow = "1px 1px 2px black, 0 0 1em red";
	//				this.dom.style.textShadow = "1px 1px 0px #000000, -1px -1px 0px #000000";
	//				this.dom.style.textShadow = "0px 1px 0px #000000, 0px 2px 0px #333333";
	this.domElement.style.textShadow = "0px 1px 0px #000000";
}

Log.prototype = {

	constructor: Log,

	appendLog: function appendLog(item) {
		var doScroll = this.domElement.scrollTop === this.domElement.scrollHeight - this.domElement.clientHeight;
		this.domElement.appendChild(item);
		if (doScroll) {
			this.domElement.scrollTop = this.domElement.scrollHeight - this.domElement.clientHeight;
		}
	},

	appendText: function appendText(text) {
		var item = document.createElement("div");
		item.innerHTML = text;
		this.appendLog(item);
	}

};

var log = new Log();

exports.log = log;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
		value: true
});
function Loop(game, amplitude) {

		this.game = game;
		this.current = 0;
		this.time = new Date().getTime();
		this.amplitude = amplitude;
		this.interval = 1000 / this.amplitude;
		this.updating = false;

		var loop = this;

		var _tick = bind(this, this.tick);
		this.tickerId = setInterval(_tick, this.interval);

		function bind(scope, fn) {
				return function () {
						fn.apply(scope, arguments);
				};
		};
}

Loop.prototype = {

		constructor: Loop,

		tick: function tick() {

				this.updating = true;

				// Увеличиваем номер текущего тика
				this.current += 1;
				// Обновляем момент начала текущего тика
				this.time = new Date().getTime();

				// Изменяем параметры в соответствии с приращениями прошлого тика
				this.game.player.position.add(this.game.player.motion);
				this.game.player.angle += this.game.player.slew;
				this.game.player.camHeight += this.game.player.camMotion;

				// Обнуляем приращения
				this.game.player.motion.set(0, 0, 0);
				this.game.player.slew = 0;
				this.game.player.camMotion = 0;

				// Передвигаем эхо
				this.game.echo.set(this.game.echo.next.position, this.game.echo.next.motion, this.game.echo.next.angle, this.game.echo.next.slew);

				// Рассчитываем единичный вектор движения прямо
				var forwardDirection = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), this.game.player.angle);

				// Расчитываем единичный вектор стрейфа направо 
				var rightDirection = new THREE.Vector3().copy(forwardDirection);
				rightDirection.applyAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI / 2);

				// Обрабатываем показания контроллера и задаем приращения текущего тика
				if (this.game.controller.rotateLeft) {
						this.game.player.slew += this.game.player.speed / (Math.PI * 2) / this.amplitude;
				}

				if (this.game.controller.rotateRight) {
						this.game.player.slew -= this.game.player.speed / (Math.PI * 2) / this.amplitude;
				}

				if (this.game.controller.moveRight) {
						this.game.player.motion.add(rightDirection);
				}

				if (this.game.controller.moveLeft) {
						this.game.player.motion.sub(rightDirection);
				}

				if (this.game.controller.moveForward) {
						this.game.player.motion.add(forwardDirection);
				};

				if (this.game.controller.moveBackward) {
						this.game.player.motion.sub(forwardDirection);
				}

				if (this.game.controller.zoomIn) {
						this.game.player.camMotion -= 0.5;
				}

				if (this.game.controller.zoomOut) {
						this.game.player.camMotion += 0.5;
				}

				// Формируем вектор движения
				this.game.player.motion.normalize();
				this.game.player.motion.multiplyScalar(this.game.player.speed / this.amplitude);

				if (this.game.controller.modifiers.shift) {
						this.game.player.motion.multiplyScalar(0.25);
						this.game.player.slew *= 0.25;
						this.game.player.camMotion *= 0.25;
				}

				this.updating = false;

				/*
    		// Формируем сообщение на сервер
    		var msg = {
    			header: {
    				time: new Date().getTime(),
    				tick: this.current,
    				type: "controller"
    			},
    			data: this.game.controller
    		};
    		// И отправляем его
    		this.game.connect.sendMessage(JSON.stringify(msg));
    */
				this.game.connect.sendController(this.game.controller);
		}

};

exports.Loop = Loop;

},{}],7:[function(require,module,exports){
'use strict';

var _log = require('./log');

var _game = require('./game');

//var myProtocol = require('./proto/protocol_pb');
//var protobuf = proto.protocol;
if (_game.game.playable) {
  _game.game.animate();
} else {

  // Браузер не соответствует требованиям
  var container = document.getElementById('container');
  container.appendChild(_log.log.domElement);
};

},{"./game":4,"./log":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
function Player(camera, mesh) {

	this.camera = camera;
	this.camHeight = 14;
	this.camMotion = 0;
	this.mesh = mesh;

	this.speed = 10;
	this.position = new THREE.Vector3(0, 0, 0.02);
	this.motion = new THREE.Vector3();
	this.angle = 0;
	this.slew = 0;
}

Player.prototype = {

	constructor: Player,

	animate: function animate(scalar) {
		// Рассчитываем позицию игрока в этом фрейме
		var motion = new THREE.Vector3().copy(this.motion);
		motion.multiplyScalar(scalar);
		var position = new THREE.Vector3().copy(this.position).add(motion);
		// Рассчитываем угол направления в этом фрейме
		var rotation = this.angle + this.slew * scalar;
		// Рассчитываем вектор направления в этом фрейме
		var direction = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

		// Перемещаем меш игрока
		this.mesh.position.copy(position);

		// Крутим игрока
		this.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

		// Рассчитываем высоту камеры в этом фрейме
		var height = this.camHeight + this.camMotion * scalar;

		// Перемещаем камеру
		var camDistance = height / -2;
		var camPos = new THREE.Vector3();
		camPos.addVectors(position, direction.multiplyScalar(camDistance));
		this.camera.position.set(camPos.x, camPos.y, height);

		// Крутим камеру
		this.camera.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');
		// И опускаем немного вниз
		this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

		// Скрываем игрока, когда камера приближается к нему слишком близко
		if (height < 5) {
			this.mesh.visible = false;
		} else {
			this.mesh.visible = true;
		}
	}
};

exports.Player = Player;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function Action() {

    this.position = new THREE.Vector3();
    this.motion = new THREE.Vector3();
    this.angle = 0;
    this.slew = 0;
}

Action.prototype = {

    constructor: Action,

    set: function set(position, motion, angle, slew) {

        this.position.copy(position);
        this.motion.copy(motion);
        this.angle = angle;
        this.slew = slew;
    },

    copy: function copy(action) {

        this.position.copy(action.position);
        this.motion.copy(action.motion);
        this.angle = action.angle;
        this.slew = action.slew;
    },

    clone: function clone() {

        return new Action().set(this.position, this.motion, this.angle, this.slew);
    }

};

function Unit(mesh) {

    this.position = new THREE.Vector3();
    this.motion = new THREE.Vector3();
    this.angle = 0;
    this.slew = 0;
    this.mesh = mesh !== undefined ? mesh : new THREE.Mesh();

    this.next = new Action();
}

Unit.prototype = {

    constructor: Unit,

    set: function set(position, motion, angle, slew) {

        this.position = position;
        this.motion = motion;
        this.angle = angle;
        this.slew = slew;
    },

    copy: function copy(unit) {

        this.position.copy(unit.position);
        this.motion.copy(unit.motion);
        this.angle = unit.angle;
        this.slew = unit.slew;
    },

    setMesh: function setMesh(mesh) {

        if (mesh !== undefined) {
            this.mesh = mesh;
        }
    },

    animate: function animate(multiplier) {

        // Рассчитываем изменение позициии в этом фрейме
        var motion = new THREE.Vector3().copy(this.motion);
        motion.multiplyScalar(multiplier);
        // Перемещаем меш
        this.mesh.position.copy(new THREE.Vector3().copy(this.position).add(motion));

        // Рассчитываем угол направления в этом фрейме
        var rotation = this.angle + this.slew * multiplier;
        // Крутим меш
        this.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');
    }

};

exports.Unit = Unit;

},{}]},{},[7]);
