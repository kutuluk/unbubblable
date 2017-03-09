class Action {

    constructor() {

        this.position = new THREE.Vector3();
        this.motion = new THREE.Vector3();
        this.angle = 0;
        this.slew = 0;

    }

    set(position, motion, angle, slew) {

        this.position.copy(position);
        this.motion.copy(motion);
        this.angle = angle;
        this.slew = slew;

    }

    copy(action) {

        this.position.copy(action.position);
        this.motion.copy(action.motion);
        this.angle = action.angle;
        this.slew = action.slew;

    }

    clone() {

        return new Action().set(this.position, this.motion, this.angle, this.slew);

    }

};

class Unit {

    constructor(mesh) {

        this.mesh = mesh !== undefined ? mesh : new THREE.Mesh();
        this.current = new Action();
        this.next = new Action();

    }

    setMesh(mesh) {

        if (mesh !== undefined) {
            this.mesh = mesh
        }

    }

    animate(multiplier) {

        // Рассчитываем изменение позициии в этом фрейме
        let motion = new THREE.Vector3().copy(this.current.motion);
        motion.multiplyScalar(multiplier);
        // Перемещаем меш
        this.mesh.position.copy(new THREE.Vector3().copy(this.current.position).add(motion));

        // Рассчитываем угол направления в этом фрейме
        let rotation = this.current.angle + this.current.slew * multiplier;
        // Крутим меш
        this.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

    }

};

export { Action, Unit };