class Movement {

    constructor(msgMovement) {

        if (msgMovement) {
            this.position = new THREE.Vector3(msgMovement.position.x, msgMovement.position.y, msgMovement.position.z);
            this.motion = new THREE.Vector3(msgMovement.motion.x, msgMovement.motion.y, msgMovement.motion.z);
            this.angle = msgMovement.angle;
            this.slew = msgMovement.slew;
        }
        else {
            this.position = new THREE.Vector3();
            this.motion = new THREE.Vector3();
            this.angle = 0;
            this.slew = 0;
        }

    }

    set(position, motion, angle, slew) {

        this.position.copy(position);
        this.motion.copy(motion);
        this.angle = angle;
        this.slew = slew;

        return this;

    }

    copy(movement) {

        this.position.copy(movement.position);
        this.motion.copy(movement.motion);
        this.angle = movement.angle;
        this.slew = movement.slew;

        return this;

    }

    clone() {

        return new Movement().set(this.position, this.motion, this.angle, this.slew);

    }

};

class Unit {

    constructor(mesh) {

        this.mesh = mesh !== undefined ? mesh : new THREE.Mesh();
        this.movement = new Movement();

    }

    setMesh(mesh) {

        if (mesh !== undefined) {
            this.mesh = mesh
        }

    }

    animate(multiplier) {

        // Рассчитываем изменение позициии в этом фрейме
        let motion = this.movement.motion.clone().multiplyScalar(multiplier);
        // Перемещаем меш
        this.mesh.position.copy(this.movement.position.clone().add(motion));

        // Рассчитываем угол направления в этом фрейме
        let rotation = this.movement.angle + this.movement.slew * multiplier;
        // Крутим меш
        this.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

    }

};

export { Movement, Unit };