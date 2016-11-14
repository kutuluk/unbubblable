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

	tick: function () {

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
		if (this.game.echo.next) {
			this.game.echo.set(new THREE.Vector3().copy(this.game.echo.next.position), new THREE.Vector3().copy(this.game.echo.next.motion), this.game.echo.next.angle, this.game.echo.next.slew);
			this.game.echo.next = undefined;
		}

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

		this.game.connect.sendController(this.game.controller);

	}

};

export { Loop };