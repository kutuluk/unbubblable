class Movement {

    // movement - Movement или protocol.Messaging.Messages.Movement.toObject()
    constructor( movement ) {

        if ( movement ) {
            this.position = new THREE.Vector3( movement.position.x, movement.position.y, movement.position.z );
            this.motion = new THREE.Vector3( movement.motion.x, movement.motion.y, movement.motion.z );
            this.angle = movement.angle;
            this.slew = movement.slew;
        } else {
            this.position = new THREE.Vector3();
            this.motion = new THREE.Vector3();
            this.angle = 0;
            this.slew = 0;
        }

    }

    set( position, motion, angle, slew ) {

        this.position.copy( position );
        this.motion.copy( motion );
        this.angle = angle;
        this.slew = slew;

        return this;

    }

    copy( movement ) {

        this.position.copy( movement.position );
        this.motion.copy( movement.motion );
        this.angle = movement.angle;
        this.slew = movement.slew;

        return this;

    }

    clone() {

        return new Movement().set( this.position, this.motion, this.angle, this.slew );

    }

}

const oX = new THREE.Vector3( 1, 0, 0 );
const oY = new THREE.Vector3( 0, 1, 0 );
const oZ = new THREE.Vector3( 0, 0, 1 );

class Unit {

    constructor( mesh ) {

        this.name = "Unit";
        this.mesh = mesh !== undefined ? mesh : new THREE.Mesh();
        this.movement = new Movement();
        this.next = new Movement();
        this.updated = false;

        // ToDo: константы для оптимизации - вынести из полей класса
        // (используются также в Player)
        this.oX = new THREE.Vector3( 1, 0, 0 );
        this.oY = new THREE.Vector3( 0, 1, 0 );
        this.oZ = new THREE.Vector3( 0, 0, 1 );

    }

    setName( name ) {
        this.name = name ? name : "Unknown";
        this.label = this.newLabel( this.name );
        //        this.label = this.newLabel( this.name, { bgColor: "rgba(0, 0, 0, 1.0)" } );
    }

    // ToDo: излишняя высота канвы (равная ширине), но если изменять - шрифт искажается
    // разобраться, можно ли создавать спрайт из разносторонних текстур
    newLabel( text, parameters ) {

        if ( parameters === undefined ) parameters = {};
        let fontsize = parameters.fontsize ? parameters.fontsize : 14;
        let fontface = parameters.fontface ? parameters.fontface : "Hobo";
        let bgColor = parameters.bgColor ? parameters.bgColor : "rgba(0, 0, 0, 0)";
        let color = parameters.color ? parameters.color : "rgba(255, 255, 255, 1.0)";

        let canvas = document.createElement( 'canvas' );
        let ctx = canvas.getContext( '2d' );

        // Вычисляем ширину канвы
        //        ctx.font = `${fontsize}px ${fontface}`;
        //        let width = ctx.measureText( text ).width;

        canvas.width = 256;
        canvas.height = 256;

        ctx.fillStyle = bgColor;
        ctx.fillRect( 0, 0, canvas.width, canvas.height );

        // Рисуем текст
        ctx.font = `${fontsize}px ${fontface}`;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.fillText( text, canvas.width / 2, canvas.height / 2 );

        // Создаем текстуру из канвы
        let texture = new THREE.Texture( canvas );
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.needsUpdate = true;

        // Создаем спрайт
        let spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        let sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set( 3, 3, 1 );
        return sprite;
    }

    setMesh( mesh ) {

        if ( mesh !== undefined ) {
            this.mesh = mesh;
            if ( this.mesh.animations ) {
                this.mixer = new THREE.AnimationMixer( this.mesh );
                this.mixer.clipAction( this.mesh.animations[ 0 ] ).play();
            }
        }

    }

    // move перемещает юнит
    move() {

        if ( this.updated ) {
            this.movement.copy( this.next );
            this.updated = false;
        } else {
            this.movement.position.add( this.movement.motion );
            this.movement.motion.set( 0, 0, 0 );
            this.movement.angle += this.movement.slew;
            this.slew = 0;
        }

    }

    animate( multiplier ) {

        // Рассчитываем изменение позициии в этом фрейме
        let motion = this.movement.motion.clone().multiplyScalar( multiplier );
        // Перемещаем меш
        this.mesh.position.copy( this.movement.position.clone().add( motion ) );

        // Рассчитываем угол направления в этом фрейме
        let rotation = this.movement.angle + this.movement.slew * multiplier;
        // Крутим меш
        this.mesh.rotation.setFromVector3( new THREE.Vector3( 0, 0, rotation ), 'XYZ' );

        // ToDo: разобраться зачем эти странные повороты/развороты ------------------------------

        // разворот головой вверх
        this.mesh.rotateOnAxis( this.oX, Math.PI / 2 );
        // компенсация кривого создания модели
        this.mesh.rotateOnAxis( this.oY, Math.PI );

        // --------------------------------------------------------------------------------------

        this.label.position.copy( this.mesh.position );
        this.label.position.z = this.mesh.position.z + 1.5;

    }

}

export { Movement, Unit };
