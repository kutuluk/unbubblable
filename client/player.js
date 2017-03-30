import { Unit } from './unit';

class Player {

    constructor( camera, unit ) {

        this.camera = camera;
        this.camHeight = 14;
        this.camMotion = 0;
        this.unit = unit;

        this.oX = new THREE.Vector3( 1, 0, 0 );
        this.oZ = new THREE.Vector3( 0, 0, 1 );

    }

    animate( scalar ) {

        // Рассчитываем позицию игрока в этом фрейме
        let motion = this.unit.movement.motion.clone().multiplyScalar( scalar );
        let position = this.unit.movement.position.clone().add( motion );
        // Рассчитываем угол направления в этом фрейме
        let rotation = this.unit.movement.angle + this.unit.movement.slew * scalar;
        // Рассчитываем вектор направления в этом фрейме
        let direction = new THREE.Vector3( 0, 1, 0 ).applyAxisAngle( this.oZ, rotation );

        // Перемещаем меш игрока
        this.unit.mesh.position.copy( position );

        // Крутим игрока
        this.unit.mesh.rotation.setFromVector3( new THREE.Vector3( 0, 0, rotation ), 'XYZ' );

        // Рассчитываем высоту камеры в этом фрейме
        let height = this.camHeight + this.camMotion * scalar;

        // Перемещаем камеру
        let camPos = position.clone().add( direction.multiplyScalar( height / -2 ) );
        this.camera.position.set( camPos.x, camPos.y, height );

        // Крутим камеру
        this.camera.rotation.setFromVector3( new THREE.Vector3( 0, 0, rotation ), 'XYZ' );
        // И опускаем немного вниз
        this.camera.rotateOnAxis( this.oX, Math.PI / 5 );

    }
}

export { Player };
