class Loop {

	constructor(game, amplitude) {

		this.game = game;
		this.current = 0;
		this.time = new Date().getTime();
		this.amplitude = amplitude;
		this.interval = 1000 / this.amplitude;
		this.updating = false;
		this.tickerId = setInterval(this.tick.bind(this), this.interval);

	}

	tick() {

		this.updating = true;

		// Увеличиваем номер текущего тика
		this.current += 1;
		// Обновляем момент начала текущего тика
		this.time = new Date().getTime();

		// Изменяем параметры в соответствии с приращениями прошлого тика
		this.game.player.unit.movement.position.add(this.game.player.unit.movement.motion);
		this.game.player.unit.movement.angle += this.game.player.unit.movement.slew;
		this.game.player.camHeight += this.game.player.camMotion;

		// Обнуляем приращения
		this.game.player.unit.movement.motion.set(0, 0, 0);
		this.game.player.unit.movement.slew = 0;
		this.game.player.camMotion = 0;

		// Передвигаем эхо
		if (this.game.echo.next) {
			this.game.echo.movement = this.game.echo.next;
			this.game.echo.next = undefined;
		}

		// Рассчитываем единичный вектор движения прямо
		let forwardDirection = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), this.game.player.unit.movement.angle);

		// Расчитываем единичный вектор стрейфа направо 
		let rightDirection = forwardDirection.clone();
		rightDirection.applyAxisAngle(new THREE.Vector3(0, 0, -1), Math.PI / 2);

		// Обрабатываем показания контроллера и задаем приращения текущего тика
		if (this.game.controller.rotateLeft) {
			this.game.player.unit.movement.slew += this.game.player.speed / (Math.PI * 2) / this.amplitude;
		}

		if (this.game.controller.rotateRight) {
			this.game.player.unit.movement.slew -= this.game.player.speed / (Math.PI * 2) / this.amplitude;
		}

		if (this.game.controller.moveRight) {
			this.game.player.unit.movement.motion.add(rightDirection);
		}

		if (this.game.controller.moveLeft) {
			this.game.player.unit.movement.motion.sub(rightDirection);
		}

		if (this.game.controller.moveForward) {
			this.game.player.unit.movement.motion.add(forwardDirection);
		};

		if (this.game.controller.moveBackward) {
			this.game.player.unit.movement.motion.sub(forwardDirection);
		}

		if (this.game.controller.zoomIn) {
			this.game.player.camMotion -= 0.5;
		}

		if (this.game.controller.zoomOut) {
			this.game.player.camMotion += 0.5;
		}

		// Формируем вектор движения
		this.game.player.unit.movement.motion.normalize();
		this.game.player.unit.movement.motion.multiplyScalar(this.game.player.speed / this.amplitude);

		if (this.game.controller.modifiers.shift) {
			this.game.player.unit.movement.motion.multiplyScalar(0.25);
			this.game.player.unit.movement.slew *= 0.25;
			this.game.player.camMotion *= 0.25;
		}

		this.updating = false;

		this.game.connect.sendController(this.game.controller);


		if (!(this.game.terrain === undefined || this.game.terrain === null)) {
			let chunksIndecies = [];
//			let cx = Math.floor(this.game.player.unit.movement.position.x / this.game.terrain.chunkSize);
//			let cy = Math.floor(this.game.player.unit.movement.position.y / this.game.terrain.chunkSize);
			let cx = Math.floor(this.game.echo.movement.position.x / this.game.terrain.chunkSize);
			let cy = Math.floor(this.game.echo.movement.position.y / this.game.terrain.chunkSize);
			// Перебор 9 смежных чанков
			for (let y = cy - 1; y < cy + 2; y++) {
				for (let x = cx - 1; x < cx + 2; x++) {
					// Проверка на допустимый диапазон
					if ((y >= 0) && (y < this.game.terrain.chunkedHeight) && (x >= 0) && (x < this.game.terrain.chunkedWidth)) {
						let index = y * this.game.terrain.chunkedWidth + x;
						// Добавление индекса чанка в список запроса в случае его отсутствия
						if (this.game.terrain.chunks[index] == undefined) {
							chunksIndecies.push(index);
						}
					}
				}
			}

			this.game.connect.sendChanksRequest(chunksIndecies);
		}

	}

};

export { Loop };