import loglevel from 'loglevel';
import remote from 'loglevel-plugin-remote';
import chat from './chat';
import Controller from './controller';
import Entities from './entities';
import Player from './player';
import Atlas from './atlas';
import Loop from './loop';
import Connect from './connect';
import Terrain from './terrain';

const logger = loglevel.getLogger('game');

class Game {
  constructor() {
    chat.init(this);

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      container: document.getElementById('container'),
    };

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x111111);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera = new THREE.PerspectiveCamera(40, this.screen.width / this.screen.height, 1, 2000);
    this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog( 0xaaaaff, 1*18, 1*24 );

    //        let ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    //        let ambientLight = new THREE.AmbientLight( 0xffffff ); // soft white light
    //        this.scene.add( ambientLight );

    //        this.dirLight = new THREE.DirectionalLight( 0xffffff );
    //        this.dirLight.position.set( 100, 100, 50 );
    //        this.scene.add( this.dirLight );

    //        let light = new THREE.HemisphereLight( 0xFFFFFF, 0x404040, 1 );
    const light = new THREE.HemisphereLight(0xffffff, 0xa0a0a0, 1);
    this.scene.add(light);

    // The X axis is red. The Y axis is green. The Z axis is blue.
    const axisHelper = new THREE.AxisHelper();
    this.scene.add(axisHelper);
    axisHelper.position.set(-1.5, -1.5, 0);

    this.atlas = new Atlas(16, 16, 32, 'assets/textures/atlas.png');

    // Загрузка моделей
    this.models = [];
    this.loader = new THREE.ObjectLoader();

    this.loadModel(0, 'assets/models/model.json', (id) => {
      // ToDo: может ли во время создания плейера модель быть еще не загруженной
      //            let model = this.models[ id ].clone();
      //            console.chat( model );
    });

    this.controller = new Controller(this.renderer.domElement);
    //        this.controller = new Controller( this.screen.container );

    this.stats = new Stats();
    this.stats.showPanel(1);
    this.stats.updatePanel = this.stats.addPanel(new Stats.Panel('Update', '#ff8', '#212'));
    this.stats.deltaPanel = this.stats.addPanel(new Stats.Panel('Delta', '#ff8', '#212'));
    this.stats.pingPanel = this.stats.addPanel(new Stats.Panel('Ping', '#ff8', '#212'));

    this.screen.container.appendChild(this.renderer.domElement);
    this.screen.container.appendChild(this.stats.domElement);
    this.screen.container.appendChild(chat.box);

    this.player = new Player(this.camera);

    this.terrain = undefined;

    //    this.createTexture();

    this.connect = new Connect(this);

    this.entities = new Entities(this);

    this.loop = new Loop(20, () => {
      this.update();
    });
    this.loop.restart();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  loadModel(id, path, handler) {
    // Загрузка модели
    this.loader.load(
      path,
      // onLoad
      (model) => {
        // ToDo: делать модели сразу в правильном масштабе
        model.scale.set(0.25, 0.25, 0.25);
        this.models[id] = model;

        if (handler) handler(id);
      },
      // onProgress
      () => {},
      // onError
      (xhr) => {
        logger.error('XHR error', xhr.status, xhr.statusText);
      },
    );
  }

  // Функция создания меша юнита
  createCharacter(tile) {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    geometry.faceVertexUvs = [[]];
    geometry.faceVertexUvs[0].push(this.atlas.tiles[tile].faces[0][0]);
    geometry.faceVertexUvs[0].push(this.atlas.tiles[tile].faces[0][1]);
    const mesh = new THREE.Mesh(geometry, this.atlas.transMaterial);
    this.scene.add(mesh);

    return mesh;
  }

  // Функция создания плашки текстуры
  createTexture() {
    const geometryTex = new THREE.PlaneGeometry(8, 8, 1, 1);
    const meshTex = new THREE.Mesh(geometryTex, this.atlas.transMaterial);
    meshTex.position.set(10, 0, 1.5);
    this.scene.add(meshTex);
  }

  onWindowResize() {
    this.screen.width = window.innerWidth;
    this.screen.height = window.innerHeight;
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.screen.width, this.screen.height);
    chat.resize();
  }

  handleMovementMessage(msgMovement) {
    this.entities.handleMovement(msgMovement);
  }

  handleTerrainMessage(msgTerrain) {
    this.terrain = new Terrain(msgTerrain, this.atlas);

    /*
    // Добавление сетки чанков
    const geoGrid = new THREE.PlaneGeometry(
      msgTerrain.width,
      msgTerrain.height,
      msgTerrain.width / msgTerrain.chunkSize,
      msgTerrain.height / msgTerrain.chunkSize,
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x4c981f,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const grid = new THREE.Mesh(geoGrid, material);
    grid.position.set(msgTerrain.width / 2, msgTerrain.height / 2, 0.005);
    this.scene.add(grid);
    */
  }

  handleChunkMessage(msgChunk) {
    if (this.terrain.chunks[msgChunk.index] === undefined) {
      this.terrain.setChunk(msgChunk);
      this.scene.add(this.terrain.chunks[msgChunk.index].meshLandscape);
      this.scene.add(this.terrain.chunks[msgChunk.index].meshDetails);
    }
  }

  handleUnitInfoMessage(message) {
    this.entities.handleUnitInfo(message);
  }

  handleConnectInfoMessage(message) {
    remote.setToken(message.uuid);
    logger.info('Соединение %s для игрока %s инициализировано', message.uuid, message.player.name);
  }

  handleSystemMessage(msg) {
    chat.systemMessage(msg.text);
  }

  handleSayMessage(message) {
    let level = 'common';

    if (message.senderId === this.player.id) {
      level = 'own';
    }

    chat.appendText(`<span>${message.senderName}:</span> ${message.text}`, level);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.stats.updatePanel.update(this.loop.busy, this.loop.interval);
    this.stats.deltaPanel.update(Math.abs(this.loop.delta), 10);
    this.stats.pingPanel.update(this.connect.ping, 100);
  }

  update() {
    this.entities.removeExpired();
    this.entities.moveEntities();

    // Обрабатываем контроллер на изменение высоты камеры
    if (this.controller.zoomIn) {
      this.player.camMotion -= 0.5;
    }

    if (this.controller.zoomOut) {
      this.player.camMotion += 0.5;
    }

    if (this.controller.modifiers.shift) {
      this.player.camMotion *= 0.25;
    }

    this.connect.sendController(this.controller);

    // Запрашиваем недостающие чанки ландшафта
    if (!(this.terrain === undefined || this.terrain === null)) {
      const indecies = [];
      const cx = Math.floor(this.player.movement.position.x / this.terrain.chunkSize);
      const cy = Math.floor(this.player.movement.position.y / this.terrain.chunkSize);
      // Перебор 9 смежных чанков
      for (let y = cy - 1; y < cy + 2; y++) {
        for (let x = cx - 1; x < cx + 2; x++) {
          // Проверка на допустимый диапазон
          if (y >= 0 && y < this.terrain.chunkedHeight && x >= 0 && x < this.terrain.chunkedWidth) {
            const index = y * this.terrain.chunkedWidth + x;
            // Добавление индекса чанка в список запроса в случае его отсутствия
            if (this.terrain.chunks[index] === undefined) {
              indecies.push(index);
            }
          }
        }
      }

      this.connect.sendChanksRequest(indecies);
    }
  }

  render() {
    // Вычисляем время, прошедшее после начала тика
    const delta = new Date().getTime() - this.loop.start;

    //        let current = ( this.loop.start - this.loop.entry ) / this.loop.interval | 0;

    // Чем больше времени прошло, тем больше множитель (0 -> 1)
    let frame = delta / this.loop.duration;
    if (frame > 1) {
      frame = 1;
    }

    this.entities.animate(frame);
    // ---
    /*
        if ( this.player.mixer ) {
            this.player.mixer.update( 0.01 );
        }
        */
    // ---

    this.renderer.render(this.scene, this.camera);

    // статистика рендера

    // const { render, memory } = this.renderer.info

    // stats.textContent = `

    // calls: ${render.calls}

    // faces: ${render.faces}

    // vertices: ${render.vertices}

    // geometries: ${memory.geometries}`
  }
}

// let game = new Game()

export default Game;
