function Player() {

	this.speed = 10;
	this.position = new THREE.Vector3(0, 0, 0.5);
	this.motion = new THREE.Vector3();
	this.angle = 0;
	this.slew = 0;

}

Player.prototype = {

	constructor: Player,

	Calc: function (mesh, scalar, isPlayer) {
		// Рассчитываем позицию игрока в этом фрейме
//		var motion = new THREE.Vector3().copy(this.motion);
//		motion.multiplyScalar(scalar);
//		var position = new THREE.Vector3().copy(this.position).add(motion);
		// Рассчитываем угол направления в этом фрейме
//		var rotation = this.angle + this.slew * scalar;
		// Рассчитываем вектор направления в этом фрейме
//		var direction = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

		// Перемещаем меш игрока
//		mesh.position.copy(position);

		// Крутим игрока
//		mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

/*
		if (isPlayer) {
			// Рассчитываем высоту камеры в этом фрейме
			var height = camHeight + camMotion * scalar;

			// Перемещаем камеру
			var camDistance = height / -2;
			var camPos = new THREE.Vector3();
			camPos.addVectors(position, direction.multiplyScalar(camDistance));
			camera.position.set(camPos.x, camPos.y, height);

			// Крутим камеру
			camera.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');
			// И опускаем немного вниз
			camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 5);

			// Скрывать игрока, когда камера приближается к нему слишком близко
			if (height < 5) {
				mesh.visible = false;
			} else {
				mesh.visible = true;
			}
		}
*/
	}
};

export { Player };