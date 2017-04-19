import { Unit } from './unit';

class Player extends Unit {

    constructor( camera, mesh ) {

        super( mesh );

        this.camera = camera;
        this.camHeight = 14;
        this.camMotion = 0;

        this.oX = new THREE.Vector3( 1, 0, 0 );
        this.oY = new THREE.Vector3( 0, 1, 0 );
        this.oZ = new THREE.Vector3( 0, 0, 1 );

    }

    animate( multiplier ) {

        super.animate( multiplier );

        // ToDo: разобраться зачем эти странные повороты/развороты ------------------------------

        // разворот головой вверх
        this.mesh.rotateOnAxis( this.oX, Math.PI / 2 );
        // компенсация кривого создания модели
        this.mesh.rotateOnAxis( this.oY, Math.PI );

        // --------------------------------------------------------------------------------------

        this.animateCamera( multiplier );

    }

    animateCamera( multiplier ) {
        // Рассчитываем угол направления в этом фрейме
        let rotation = this.movement.angle + this.movement.slew * multiplier;
        // Рассчитываем вектор направления в этом фрейме
        let direction = this.oY.clone().applyAxisAngle( this.oZ, rotation );
        // Рассчитываем высоту камеры в этом фрейме
        let height = this.camHeight + this.camMotion * multiplier;

        // Перемещаем камеру
        let camPos = this.mesh.position.clone().add( direction.multiplyScalar( height / -2 ) );
        this.camera.position.set( camPos.x, camPos.y, height );

        // Крутим камеру
        this.camera.rotation.setFromVector3( new THREE.Vector3( 0, 0, rotation ), 'XYZ' );
        // И опускаем немного вниз
        this.camera.rotateOnAxis( this.oX, Math.PI / 5 );
    }
}

export { Player };
