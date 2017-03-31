import { log } from './log';
import { Controller } from './controller';
import { Movement, Unit } from './unit';
import { Player } from './player';
import { Atlas } from './atlas';
import { Loop } from './loop';
import { Connect } from './connect';
import { Terrain } from './terrain';

class Game {

    constructor() {

        this.playable = false;

        if ( !Detector.webgl ) {
            Detector.addGetWebGLMessage();
            log.appendText( '[ERROR] Браузер не поддерживает WebGL.' );
            return;
        }

        if ( !window.WebSocket ) {
            log.appendText( '[ERROR] Браузер не поддерживает WebSockets.' );
            return;
        }

        this.playable = true;

        this.screen = {};
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.screen.container = document.getElementById( 'container' );


        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( 0x111111 );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.screen.width, this.screen.height );

        this.camera = new THREE.PerspectiveCamera( 40, this.screen.width / this.screen.height, 1, 2000 );
        this.camera.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), Math.PI / 5 );

        this.scene = new THREE.Scene();
        //	this.scene.fog = new THREE.Fog( 0xaaaaff, 1*18, 1*24 );

        //        let ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
        //        let ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
        //        this.scene.add( ambientLight );

        this.dirLight = new THREE.DirectionalLight( 0xffffff );
        this.dirLight.position.set( 100, 100, 50 );
        this.scene.add( this.dirLight );

        // The X axis is red. The Y axis is green. The Z axis is blue.
        let axisHelper = new THREE.AxisHelper();
        this.scene.add( axisHelper );
        axisHelper.position.set( -1.5, -1.5, 0 );

        this.atlas = new Atlas( 16, 16, 32, 'assets/textures/atlas.png' );

        // Загрузка модели
        let loader = new THREE.ObjectLoader();
        loader.load(
            "assets/models/model.json",
            // onLoad
            ( obj ) => {
                this.model = obj;
                this.scene.add( obj );
                this.player.unit.mesh = obj;
                obj.scale.set( 0.5, 0.5, 0.5 );
                console.log( obj );
            },
            // onProgress
            ( xhr ) => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // onError
            ( xhr ) => {
                console.error( 'An error happened' );
            }
        );

        this.controller = new Controller( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.showPanel( 1 );
        this.stats.updatePanel = this.stats.addPanel( new Stats.Panel( 'Update', '#ff8', '#212' ) );
        this.stats.deltaPanel = this.stats.addPanel( new Stats.Panel( 'Delta', '#ff8', '#212' ) );
        this.stats.pingPanel = this.stats.addPanel( new Stats.Panel( 'Ping', '#ff8', '#212' ) );

        this.screen.container.appendChild( this.renderer.domElement );
        this.screen.container.appendChild( this.stats.domElement );
        this.screen.container.appendChild( log.domElement );


        //        this.player = new Player( this.camera, new Unit( this.createCharacter( 220 ) ) ); //219
        this.player = new Player( this.camera, new Unit( /*this.model*/) ); //219

        this.terrain = undefined;

        //    this.createTexture();

        this.connect = new Connect( this );

        this.loop = new Loop( 20, () => { this.update(); } );

        window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    }

    // Функция создания меша юнита
    createCharacter( tile ) {
        let geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
        geometry.faceVertexUvs = [
            []
        ];
        geometry.faceVertexUvs[ 0 ].push( this.atlas.tiles[ tile ].faces[ 0 ][ 0 ] );
        geometry.faceVertexUvs[ 0 ].push( this.atlas.tiles[ tile ].faces[ 0 ][ 1 ] );
        let mesh = new THREE.Mesh( geometry, this.atlas.transMaterial );
        this.scene.add( mesh );

        return mesh;
    }

    // Функция создания плашки текстуры
    createTexture() {
        let geometryTex = new THREE.PlaneGeometry( 8, 8, 1, 1 );
        let meshTex = new THREE.Mesh( geometryTex, this.atlas.transMaterial );
        meshTex.position.set( 10, 0, 1.5 );
        this.scene.add( meshTex );
    }

    onWindowResize() {
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.camera.aspect = this.screen.width / this.screen.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.screen.width, this.screen.height );
    }

    handleMovementMessage( msgMovement ) {

        this.player.unit.next = new Movement( msgMovement );

    }

    handleTerrainMessage( msgTerrain ) {

        this.terrain = new Terrain( msgTerrain, this.atlas );

        // Добавление сетки чанков
        /*
        var geoGrid = new THREE.PlaneGeometry(msgTerrain.width, msgTerrain.height, msgTerrain.width / msgTerrain.chunkSize, msgTerrain.height / msgTerrain.chunkSize);
        var material = new THREE.MeshBasicMaterial({ color: 0x4c981f, wireframe: true, side: THREE.DoubleSide });
        var grid = new THREE.Mesh(geoGrid, material);
        grid.position.set(msgTerrain.width / 2, msgTerrain.height / 2, 0.005);
        this.scene.add(grid);
        */

    }

    handleChunkMessage( msgChunk ) {
        if ( this.terrain.chunks[ msgChunk.index ] === undefined ) {

            this.terrain.setChunk( msgChunk );
            this.scene.add( this.terrain.chunks[ msgChunk.index ].meshLandscape );
            this.scene.add( this.terrain.chunks[ msgChunk.index ].meshDetails );

        }
    }

    animate() {
        requestAnimationFrame( this.animate.bind( this ) );
        this.render();
        this.stats.update();
        this.stats.updatePanel.update( this.loop.busy, this.loop.interval );
        this.stats.deltaPanel.update( Math.abs( this.loop.delta ), 10 );
        this.stats.pingPanel.update( this.connect.ping, 100 );
    }

    update() {

        // Передвигаем игрока
        if ( this.player.unit.next ) {
            this.player.unit.movement = this.player.unit.next;
            this.player.unit.next = undefined;
        } else {
            this.player.unit.movement.position.add( this.player.unit.movement.motion );
            this.player.unit.movement.motion.set( 0, 0, 0 );
            this.player.unit.movement.angle += this.player.unit.movement.slew;
            this.slew = 0;
        }

        // Изменяем высоту камеры
        this.player.camHeight += this.player.camMotion;
        this.player.camMotion = 0;

        // Обрабатываем контроллер на изменение высоты камеры
        if ( this.controller.zoomIn ) {
            this.player.camMotion -= 0.5;
        }

        if ( this.controller.zoomOut ) {
            this.player.camMotion += 0.5;
        }

        if ( this.controller.modifiers.shift ) {
            this.player.camMotion *= 0.25;
        }

        this.connect.sendController( this.controller );

        // Запрашиваем недостающие чанки ландшафта
        if ( !( this.terrain === undefined || this.terrain === null ) ) {
            let indecies = [];
            let cx = Math.floor( this.player.unit.movement.position.x / this.terrain.chunkSize );
            let cy = Math.floor( this.player.unit.movement.position.y / this.terrain.chunkSize );
            // Перебор 9 смежных чанков
            for ( let y = cy - 1; y < cy + 2; y++ ) {
                for ( let x = cx - 1; x < cx + 2; x++ ) {
                    // Проверка на допустимый диапазон
                    if ( ( y >= 0 ) && ( y < this.terrain.chunkedHeight ) && ( x >= 0 ) && ( x < this.terrain.chunkedWidth ) ) {
                        let index = y * this.terrain.chunkedWidth + x;
                        // Добавление индекса чанка в список запроса в случае его отсутствия
                        if ( this.terrain.chunks[ index ] === undefined ) {
                            indecies.push( index );
                        }
                    }
                }
            }

            this.connect.sendChanksRequest( indecies );
        }

    }

    render() {

        // Вычисляем время, прошедшее после начала тика
        let delta = new Date().getTime() - this.loop.start;
        // Чем больше времени прошло, тем больше множитель (0 -> 1)

        let current = ( this.loop.start - this.loop.entry ) / this.loop.interval | 0;

        let frame = delta / this.loop.duration;

        if ( current > this.loop.current ) {
            let frame = 1;
        }


        this.player.animate( frame );


        this.renderer.render( this.scene, this.camera );

        // статистика рендера
        //				const { render, memory } = this.renderer.info
        //				stats.textContent = `
        //				calls: ${render.calls}
        //				faces: ${render.faces}
        //				vertices: ${render.vertices}
        //				geometries: ${memory.geometries}`
    }

}

let game = new Game();

export { game };
