import { Unit } from './unit';

class Player {

	constructor(camera, mesh) {

		this.speed = 10;

		this.camera = camera;
		this.camHeight = 14;
		this.camMotion = 0;

		this.unit = new Unit();
		this.unit.current.set(new THREE.Vector3(0, 0, 0.02), new THREE.Vector3(), 0, 0);
		this.unit.setMesh(mesh);

	}

	animate(scalar) {
		// Рассчитываем позицию игрока в этом фрейме
		var motion = new THREE.Vector3().copy(this.unit.current.motion);
		motion.multiplyScalar(scalar);
		var position = new THREE.Vector3().copy(this.unit.current.position).add(motion);
		// Рассчитываем угол направления в этом фрейме
		var rotation = this.unit.current.angle + this.unit.current.slew * scalar;
		// Рассчитываем вектор направления в этом фрейме
		var direction = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), rotation);

		// Перемещаем меш игрока
		this.unit.mesh.position.copy(position);

		// Крутим игрока
		this.unit.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

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
			this.unit.mesh.visible = false;
		} else {
			this.unit.mesh.visible = true;
		}
	}
};

export { Player };