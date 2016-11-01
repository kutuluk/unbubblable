import { log } from './log';
import { Controller } from './controller';
import { Unit } from './unit';
import { Player } from './player';
import { Atlas } from './atlas';
import { Loop } from './loop';
import { Connect } from './connect';


function Game() {

    this.playable = false;

    // Проверяем поддержку WebGL
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        log.appendText("[RENDERER] Браузер не поддерживает WebGL.");
        return
    };

    // Проверяем поддержку WebSockets
    if (!window["WebSocket"]) {
        log.appendText("[WS] Браузер не поддерживает WebSockets.");
        return
    };

    // Проверяем поддержку Protocol Buffers
    if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
        log.appendText("[PROTO] Не обнаружена поддержка Protocol Buffers.");
        return
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

    var atlas = new Atlas(16, 16, 32, 'textures/atlas.png');


    this.controller = new Controller(this.renderer.domElement);

    this.stats = new Stats();

    this.screen.container.appendChild(this.renderer.domElement);
    this.screen.container.appendChild(this.stats.domElement);
    this.screen.container.appendChild(log.domElement);


    //    this.player = new Player(this.camera, createPlayerMesh());
    this.player = new Player(this.camera, createEchoMesh(219));
    this.echo = new Unit(createEchoMesh(220));
    createTerrain();

    var mapSize = 64;
    for (var i = 0; i < mapSize * mapSize / 16; i++) {
        var x = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
        var y = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
        var csale = Math.random() * (1 - 0.7) + 0.7;
        createDecole(x, y, csale, 39); //200
    };

    for (var i = 0; i < mapSize * mapSize / 48; i++) {
        var x = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
        var y = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
        var csale = Math.random() * (1 - 0.7) + 0.7;
        createDecole(x, y, csale, 55);
    };

    //    createTexture();

    this.connect = new Connect(0, this);


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

        return meshPlayer
    };

    // Эхо персонажа
    function createEchoMesh(tile) {
        var geometryEcho = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometryEcho.faceVertexUvs = [[]];
        geometryEcho.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][0]);
        geometryEcho.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][1]);
        var meshEcho = new THREE.Mesh(geometryEcho, atlas.transMaterial);
        game.scene.add(meshEcho);

        return meshEcho
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
        //        var br = [0, 0, 0, 0, 17, 19, 53, 53, 78, 126, 142];
        var br = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 203, 203, 203, 203, 202, 201, 201, 17, 142, 19];

        var geometryMap = new THREE.PlaneGeometry(mapSize, mapSize, mapSize, mapSize);
        geometryMap.faceVertexUvs = [[]];
        for (var i = 0; i < mapSize * mapSize; i++) {
            var s = Math.floor(Math.random() * (br.length));
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

        // Подготавливаем меши для пеньков
        var faceTop = 21;
        var fw = [20, 116, 117]; // +153

        var faceWalls = [];

        for (var w = 0; w < fw.length; w++) {

            var geometryCube = new THREE.BoxGeometry(1, 1, 1);
            geometryCube.faceVertexUvs = [[]];
            for (var i = 0; i < 6; i++) {
                geometryCube.faceVertexUvs[0].push(atlas.tiles[fw[w]].faces[0][0]); //231+i
                geometryCube.faceVertexUvs[0].push(atlas.tiles[fw[w]].faces[0][1]);
            }
            geometryCube.faceVertexUvs[0][2 * 2] = atlas.tiles[faceTop].faces[0][0];
            geometryCube.faceVertexUvs[0][2 * 2 + 1] = atlas.tiles[faceTop].faces[0][1];

            var meshCube = new THREE.Mesh(geometryCube, atlas.opaqueMaterial);
            meshCube.rotation.x = Math.PI / 2;

            faceWalls.push(meshCube);
        }

        // Рассаживаем пеньки
        for (var i = 0; i < mapSize * mapSize / 16; i++) {
            var x = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
            var y = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize / 2);
            var w = Math.floor(Math.random() * (fw.length));

            faceWalls[w].position.set(x + 0.5, y + 0.5, 0.5);
            game.scene.add(faceWalls[w].clone());
            //            faceWalls[w].position.set(x + 0.5, y + 0.5, 1.5);
            //            game.scene.add(faceWalls[w].clone());
        };

    };

    // Травка
    function createDecole(x, y, scale, tile) {
        var geometryDec = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometryDec.faceVertexUvs = [[]];
        geometryDec.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][0]);  //89 //90 //13 //56
        geometryDec.faceVertexUvs[0].push(atlas.tiles[tile].faces[0][1]);
        var meshDec = new THREE.Mesh(geometryDec, atlas.transMaterial);
        meshDec.rotation.x = Math.PI / 2;

        var groupDec = new THREE.Group();

        meshDec.position.set(0, 0, 0);
        groupDec.add(meshDec.clone());

        meshDec.rotation.y = Math.PI / 2;
        groupDec.add(meshDec.clone());

        /*
        var count = 4;
        for (var i = 0; i < count; i++) {
            meshDec.position.y = y + i / count + 1 / count / 2;
            groupDec.add(meshDec.clone());
        }
        */

        groupDec.position.set(x + 0.5, y + 0.5, scale / 2);
        groupDec.rotation.z = Math.random() * (Math.PI / 2);
        groupDec.scale.set(scale, scale, scale);

        game.scene.add(groupDec);
    }

    this.loop = new Loop(this, 20);


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

    onWindowResize: function () {
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.camera.aspect = this.screen.width / this.screen.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.screen.width, this.screen.height);
    },

    animate: function () {
        game.render();
        game.stats.update();
        requestAnimationFrame(game.animate);
    },

    render: function () {
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

}

var game = new Game();

export { game };
