function Action() {

    this.position = new THREE.Vector3();
    this.motion = new THREE.Vector3();
    this.angle = 0;
    this.slew = 0;

}

Action.prototype = {

    constructor: Action,

    set: function (position, motion, angle, slew) {

        this.position.copy(position);
        this.motion.copy(motion);
        this.angle = angle;
        this.slew = slew;

    },

    copy: function (action) {

        this.position.copy(action.position);
        this.motion.copy(action.motion);
        this.angle = action.angle;
        this.slew = action.slew;

    },

    clone: function () {

        return new Action().set(this.position, this.motion, this.angle, this.slew);

    }

};

function Unit(mesh) {

    this.position = new THREE.Vector3();
    this.motion = new THREE.Vector3();
    this.angle = 0;
    this.slew = 0;
    this.mesh = mesh !== undefined ? mesh : new THREE.Mesh();

   	this.next = new Action();

}

Unit.prototype = {

    constructor: Unit,

    set: function (position, motion, angle, slew) {

        this.position = position;
        this.motion = motion;
        this.angle = angle;
        this.slew = slew;

    },

    copy: function (unit) {

        this.position.copy(unit.position);
        this.motion.copy(unit.motion);
        this.angle = unit.angle;
        this.slew = unit.slew;

    },

    setMesh: function (mesh) {

        if (mesh !== undefined) {
            this.mesh = mesh
        }

    },

    animate: function (multiplier) {

        // Рассчитываем изменение позициии в этом фрейме
        var motion = new THREE.Vector3().copy(this.motion);
        motion.multiplyScalar(multiplier);
        // Перемещаем меш
        this.mesh.position.copy(new THREE.Vector3().copy(this.position).add(motion));

        // Рассчитываем угол направления в этом фрейме
        var rotation = this.angle + this.slew * multiplier;
        // Крутим меш
        this.mesh.rotation.setFromVector3(new THREE.Vector3(0, 0, rotation), 'XYZ');

    }

};

export { Unit, Action };