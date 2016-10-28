
			if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			var renderer, scene, camera, stats;

			var meshMap;
			var meshCube;
			var meshChar;
			var meshEchoChar;
			var WIDTH = window.innerWidth;
			var HEIGHT = window.innerHeight;

			var keyboard = new THREEx.KeyboardState();

			var scale = 16;

			var ping = 100;

			var Character = {};
			Character.position = new THREE.Vector3(0, 0, scale/4);
			Character.angle = 0; //угол

//	var clock = new THREE.Clock();

			var camHeight = 14;

			function Log() {
				this.dom = document.createElement("div");

				//this.dom.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
				this.dom.style.margin = "0";
				this.dom.style.textAlign = "left";
				this.dom.style.padding = "0.5em 0.5em 0.5em 0.5em";
				this.dom.style.position = "absolute";
				this.dom.style.left = "1em";
				this.dom.style.width = "30em";
				this.dom.style.height = "10em";
				this.dom.style.bottom = "1em";
				this.dom.style.overflow = "auto";
//				this.dom.style.font = "normal 16px Fixedsys";
				this.dom.style.font = "normal 16px sans-serif";
//				this.dom.style.textShadow = "1px 1px 2px black, 0 0 1em red";
//				this.dom.style.textShadow = "1px 1px 0px #000000, -1px -1px 0px #000000";
//				this.dom.style.textShadow = "0px 1px 0px #000000, 0px 2px 0px #333333";
				this.dom.style.textShadow = "0px 1px 0px #000000";

		    	this.appendLog = function(item) {
        			var doScroll = this.dom.scrollTop === this.dom.scrollHeight - this.dom.clientHeight;
        			this.dom.appendChild(item);
        			if (doScroll) {
            			this.dom.scrollTop = this.dom.scrollHeight - this.dom.clientHeight;
        			}
    			};
				
				this.appendText = function(text) {
			        var item = document.createElement("div");
			        item.innerHTML = text;
			        this.appendLog(item);
				};
			};

			var log = new Log();

			WebSocketConnect = function () {

				var _this = this;

			    if (window["WebSocket"]) {

					this.connected = false;
			        this.ws = new WebSocket("ws://" + window.location.host + "/echo");

					this.ws.onopen = function() {
						_this.connected = true;

						log.appendText("[WS] Соединение установлено.");
						//this.send("test");
					};

					this.ws.onerror = function(error) {
						log.appendText("[WS] Ошибка: " + error.message);
					};

					this.ws.onclose = function(event) {
						//this.connected = false;
						var text ="[WS] ";
						if (event.wasClean) {
							text += 'Соединение закрыто чисто.';
						} else {
							text += 'Обрыв соединения.';
						}
						text += 'Код: ' + event.code + ', причина: ' + event.reason;
				        log.appendText(text);
					};

        			this.ws.onmessage = function (evt) {
						/*
						log.appendText("[SRW] Получены данные:");
			            var messages = evt.data.split('\n');
			            for (var i = 0; i < messages.length; i++) {
							log.appendText(messages[i]);
			            }
						*/
						var msg = JSON.parse(evt.data);
						console.log(msg.data);
					//	meshEchoChar.position.set(msg.data.position.x, msg.data.position.y, msg.data.position.z);
						meshEchoChar.position.x = msg.data.position.x;
						meshEchoChar.position.y = msg.data.position.y;
						var echoQuat = new THREE.Quaternion();
						echoQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), msg.data.angle);
						meshEchoChar.rotation.setFromQuaternion( echoQuat, 'XYZ' );

			        };

					this.send = function (msg) {
						if (this.connected) {
							_this = this;
							setTimeout(function() {_this.ws.send(msg);}, Math.floor(Math.random() * ping));
						}
		//				this.ws.send(msg);
					};

    			} else {
			        log.appendText("[WS] Браузер не поддерживает WebSockets.");
    			}
			};

			var connect = new WebSocketConnect();

			var currTick = 0;
			function tick() {
				
				var msg = {
					time: new Date().getTime(),
					tick: currTick,
			    	type: "character",
					data: Character
				};
				connect.send(JSON.stringify(msg));

				currTick += 1;
			}


			init();

			var timerId = setInterval(tick, 50);

			animate();
			

			function init() {

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setClearColor( 0x111111 );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( WIDTH, HEIGHT );

				camera = new THREE.PerspectiveCamera( 40, WIDTH / HEIGHT, 1, scale*200 );

				scene = new THREE.Scene();

//				scene.fog = new THREE.Fog( 0xaaaaff, scale*18, scale*24 );

				var atlas = {};
				atlas.Cols = 16;
				atlas.Rows = 16;
				atlas.TileSize = 32;
				atlas.Uoff = 1/atlas.Cols / (atlas.TileSize + 2);
				atlas.Voff = 1/atlas.Rows / (atlas.TileSize + 2);


				var canvas = document.createElement("canvas");
				canvas.width = atlas.Cols*(atlas.TileSize + 2);
				canvas.height = atlas.Rows*(atlas.TileSize + 2);
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

							ctx.drawImage(img, sx, sy, atlas.TileSize, atlas.TileSize, dx+1, dy+1, atlas.TileSize, atlas.TileSize);

							ctx.drawImage(img, sx, sy, 1, atlas.TileSize, dx, dy+1, 1, atlas.TileSize);
							ctx.drawImage(img, sx+atlas.TileSize-1, sy, 1, atlas.TileSize, dx+atlas.TileSize + 1, dy+1, 1, atlas.TileSize);

							ctx.drawImage(img, sx, sy, atlas.TileSize, 1, dx+1, dy, atlas.TileSize, 1);
							ctx.drawImage(img, sx, sy+atlas.TileSize-1, atlas.TileSize, 1, dx+1, dy+atlas.TileSize + 1, atlas.TileSize, 1);

						};
					};
					canvasMap.needsUpdate = true;
				};
                img.src = 'textures/atlas.png';
				
				atlas.Tiles = [];

				for (var i = 0; i < atlas.Cols*atlas.Rows; i++) {

					var v = Math.floor(i / atlas.Cols)
					var u = i - ( v * atlas.Cols)
				
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
						new THREE.Vector2(u/atlas.Cols+atlas.Uoff, (v+1)/atlas.Rows-atlas.Voff),
						new THREE.Vector2((u+1)/atlas.Cols-atlas.Uoff, (v+1)/atlas.Rows-atlas.Voff),
						new THREE.Vector2((u+1)/atlas.Cols-atlas.Uoff, v/atlas.Rows+atlas.Voff),
						new THREE.Vector2(u/atlas.Cols+atlas.Uoff, v/atlas.Rows+atlas.Voff)
					];

					tile.Faces = [];

					tile.Faces.push( [
						[ tile.UVs[3], tile.UVs[0], tile.UVs[2] ],
						[ tile.UVs[0], tile.UVs[1], tile.UVs[2] ] ] );

					tile.Faces.push( [
						[ tile.UVs[2], tile.UVs[3], tile.UVs[1] ],
						[ tile.UVs[3], tile.UVs[0], tile.UVs[1] ] ] );

					tile.Faces.push( [
						[ tile.UVs[1], tile.UVs[2], tile.UVs[0] ],
						[ tile.UVs[2], tile.UVs[3], tile.UVs[0] ] ] );

					tile.Faces.push( [
						[ tile.UVs[0], tile.UVs[1], tile.UVs[3] ],
						[ tile.UVs[1], tile.UVs[2], tile.UVs[3] ] ] );

					atlas.Tiles.push( tile );
				}

				var atlasMap = new THREE.MeshBasicMaterial( { map: canvasMap } );

				var transMaterial = new THREE.MeshBasicMaterial( { map: canvasMap } );
				transMaterial.transparent = true;
				transMaterial.opacity = 0.8;
				transMaterial.side = THREE.DoubleSide;

				// Map
				/*
				var geometryMap = new THREE.PlaneGeometry( scale*16, scale*16, 16, 16 );
				geometryMap.faceVertexUvs = [[]];
				for (var i = 0; i < 256; i++) {
					geometryMap.faceVertexUvs[0].push( atlas.Tiles[i].Faces[0][0] );
					geometryMap.faceVertexUvs[0].push( atlas.Tiles[i].Faces[0][1] );
				}
				*/

				var mapSize = 32;
//				var br = [0,0,0,0,17,18,19,48,53,78,133,126,142];
				var br = [0,0,0,0,17,19,53,53,78,126,142];
				var geometryMap = new THREE.PlaneGeometry( scale*mapSize, scale*mapSize, mapSize, mapSize );

				geometryMap.faceVertexUvs = [[]];
				for (var i = 0; i < mapSize*mapSize; i++) {

					var s = Math.floor(Math.random() * (br.length));
					geometryMap.faceVertexUvs[0].push( atlas.Tiles[br[s]].Faces[0][0] );
					geometryMap.faceVertexUvs[0].push( atlas.Tiles[br[s]].Faces[0][1] );
				}

				meshMap = new THREE.Mesh( geometryMap, atlasMap );
				scene.add( meshMap );

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
				var geometryCube = new THREE.BoxGeometry( scale, scale, scale );
				var faceTop = 21;
				var faceWall = 20;
				geometryCube.faceVertexUvs = [[]];
				for (var i = 0; i < 6; i++) {
					geometryCube.faceVertexUvs[0].push( atlas.Tiles[faceWall].Faces[0][0] ); //231+i
					geometryCube.faceVertexUvs[0].push( atlas.Tiles[faceWall].Faces[0][1] );
				}
				geometryCube.faceVertexUvs[0][2*2] = atlas.Tiles[faceTop].Faces[0][0];
				geometryCube.faceVertexUvs[0][2*2+1] = atlas.Tiles[faceTop].Faces[0][1];

				meshCube = new THREE.Mesh( geometryCube, atlasMap );
				meshCube.rotation.x = Math.PI/2;

				// добавляем 30 пеньков
				for (var i = 0; i < 30; i++) {
					var x = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize/2);
					var y = Math.floor(Math.random() * (mapSize)) - Math.floor(mapSize/2);
					meshCube.position.set(x*scale + scale/2, y*scale + scale/2, scale/2);
					scene.add( meshCube.clone() );
				}

				meshCube.position.set(1*scale + scale/2, 1*scale + scale/2, scale/2);
				scene.add( meshCube );

				// Tex
				var geometryTex = new THREE.PlaneGeometry( 2*scale*3, 2*scale*3, 1, 1 );
				meshTex = new THREE.Mesh( geometryTex, atlasMap );
				meshTex.position.set( scale*8, 0, scale );
				//scene.add( meshTex );

				// Char
				var geometryChar = new THREE.BoxGeometry( scale/2, scale/2, scale/2 );
				meshChar = new THREE.Mesh( geometryChar, atlasMap );
				geometryChar.faceVertexUvs = [[]];
				for (var i = 0; i < 6; i++) {
					geometryChar.faceVertexUvs[0].push( atlas.Tiles[217].Faces[0][0] );
					geometryChar.faceVertexUvs[0].push( atlas.Tiles[217].Faces[0][1] );
				}
				meshChar.position.z = scale/4;
				//meshChar.visible = false;
				scene.add( meshChar );

				// echoChar
				var geometryEchoChar = new THREE.PlaneGeometry( 1*scale, 1*scale, 1, 1 );
				geometryEchoChar.faceVertexUvs = [[]];
				geometryEchoChar.faceVertexUvs[0].push( atlas.Tiles[220].Faces[0][0] );
				geometryEchoChar.faceVertexUvs[0].push( atlas.Tiles[220].Faces[0][1] );
				meshEchoChar = new THREE.Mesh( geometryEchoChar, transMaterial );

				meshEchoChar.position.set( 0, 0, 0.01 );
				scene.add( meshEchoChar );

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
var length = 2*scale;
var hex = 0xffff00;
var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
scene.add( arrowHelper );
*/

				var container = document.getElementById( 'container' );
				container.appendChild( renderer.domElement );

				stats = new Stats();
				container.appendChild( stats.dom );

				container.appendChild( log.dom );

				//
				var debug = document.getElementById( 'info' );

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {
				requestAnimationFrame( animate );

				render();
				stats.update();
			}

			function render() {

				var time = Date.now() * 0.001;

//			connect.send(time);
//	        log.appendText(connect.connected);

				if( keyboard.pressed("Q") ) {
					Character.angle += 0.05;
				}

				if( keyboard.pressed("E") ) {
					Character.angle -= 0.05;
				}

				// направление взгляда вперед
				var charQuat = new THREE.Quaternion();
				charQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Character.angle);
				//var charQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Character.angle);

				// вектор движения вперед
				var charDirection = new THREE.Vector3( 0, 1, 0 );
				charDirection.applyQuaternion( charQuat );

				// направление взгляда направо
				var charRightQuat = new THREE.Quaternion();
				charRightQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Character.angle - Math.PI/2);

				// вектор движения направо 
				var charRightDirection = new THREE.Vector3( 0, 1, 0 );
				charRightDirection.applyQuaternion( charRightQuat );

				var speed = 1.5;

				var charMotion = new THREE.Vector3();

				if( keyboard.pressed("D") ) {
					charMotion.add(charRightDirection);
				}

				if( keyboard.pressed("A") ) {
					charMotion.sub(charRightDirection);
				}

				if( keyboard.pressed("W") ) {
					charMotion.add(charDirection);
				}

				if( keyboard.pressed("S") ) {
					charMotion.sub(charDirection);
				}


				if( keyboard.pressed("pageup") ) {
					camHeight -= 0.1;
				}

				if( keyboard.pressed("pagedown") ) {
					camHeight += 0.1;
				}

				// Перемещаем чара
				charMotion.normalize();
				charMotion.multiplyScalar( speed );
				Character.position.add( charMotion );

				//meshChar.position = Character.position;
				meshChar.position.x = Character.position.x;
				meshChar.position.y = Character.position.y;

				// крутим чара
				meshChar.rotation.setFromQuaternion( charQuat, 'XYZ' );
				//meshChar.rotateOnAxis( new THREE.Vector3(-1,0,0), time*0.5);

				// крутим камеру
				camera.rotation.setFromQuaternion( charQuat, 'XYZ' );
				camera.rotateOnAxis( new THREE.Vector3(1,0,0), Math.PI/5);

				var camDistance = camHeight*scale/-2;
				
				// перемещаем камеру
				var camPos = new THREE.Vector3();
				camPos.addVectors( Character.position, charDirection.multiplyScalar( camDistance ) );
				camera.position.set( camPos.x, camPos.y, camHeight*scale );

				//console.log(camera.position);

				renderer.render( scene, camera );

// статистика рендера
//				const { render, memory } = renderer.info
//				stats.textContent = `
//				calls: ${render.calls}
//				faces: ${render.faces}
//				vertices: ${render.vertices}
//				geometries: ${memory.geometries}`
			}
