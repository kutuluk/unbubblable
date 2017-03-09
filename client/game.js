import { log } from './log';
import { Controller } from './controller';
import { Action, Unit } from './unit';
import { Player } from './player';
import { Atlas } from './atlas';
import { Loop } from './loop';
import { Connect } from './connect';
import { Terrain } from './map';


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

    this.camera = new THREE.PerspectiveCamera(40, this.screen.width / this.screen.height, 1, 2000);
    this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

    this.scene = new THREE.Scene();
    //	this.scene.fog = new THREE.Fog( 0xaaaaff, 1*18, 1*24 );

    this.atlas = new Atlas(16, 16, 32, 'textures/atlas.png');


    this.controller = new Controller(this.renderer.domElement);

    this.stats = new Stats();

    this.screen.container.appendChild(this.renderer.domElement);
    this.screen.container.appendChild(this.stats.domElement);
    this.screen.container.appendChild(log.domElement);


    this.player = new Player(this.camera, createCharacter(219));
    this.echo = new Unit(createCharacter(220));

    this.terrain = undefined;

    //    createTexture();

    this.connect = new Connect(this);

    // Персонаж
    function createCharacter(tile) {
        var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
        geometry.faceVertexUvs = [[]];
        geometry.faceVertexUvs[0].push(game.atlas.tiles[tile].faces[0][0]);
        geometry.faceVertexUvs[0].push(game.atlas.tiles[tile].faces[0][1]);
        var mesh = new THREE.Mesh(geometry, game.atlas.transMaterial);
        game.scene.add(mesh);

        return mesh
    };

    // Текстура
    function createTexture() {
        var geometryTex = new THREE.PlaneGeometry(8, 8, 1, 1);
        var meshTex = new THREE.Mesh(geometryTex, game.atlas.transMaterial);
        meshTex.position.set(10, 0, 1.5);
        game.scene.add(meshTex);
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

    handlePlayerPositionMessage: function (msgPlayerPosition) {

        this.echo.next = new Action();
        this.echo.next.position.set(msgPlayerPosition.Position.X, msgPlayerPosition.Position.Y, msgPlayerPosition.Position.Z);
        this.echo.next.motion.set(msgPlayerPosition.Motion.X, msgPlayerPosition.Motion.Y, msgPlayerPosition.Motion.Z);
        this.echo.next.angle = msgPlayerPosition.Angle;
        this.echo.next.slew = msgPlayerPosition.Slew;

    },

    handleTerrainMessage: function (msgTerrain) {

        this.terrain = new Terrain(msgTerrain.Width, msgTerrain.Height, msgTerrain.ChunkSize, this.atlas);

        var geoGrid = new THREE.PlaneGeometry(msgTerrain.Width, msgTerrain.Height, msgTerrain.Width / msgTerrain.ChunkSize, msgTerrain.Height / msgTerrain.ChunkSize);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, side: THREE.DoubleSide });
        var grid = new THREE.Mesh(geoGrid, material);
        grid.position.set(msgTerrain.Width / 2, msgTerrain.Height / 2, 0.03);
        this.scene.add(grid);
    },

    handleChunkMessage: function (msgChunk) {

        if (this.terrain.chunks[msgChunk.Index] == undefined) {

            this.terrain.setChunk(msgChunk);
            this.scene.add(this.terrain.chunks[msgChunk.Index].meshLandscape);
            this.scene.add(this.terrain.chunks[msgChunk.Index].meshDetails);

        }

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
