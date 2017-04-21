import { log } from './log';
import { Unit, Movement } from './unit';

const expireTime = 1000;

//ToDo: переименвать тупые Entity и Entities

class Entity {

    constructor( movement ) {
        this.unit = new Unit();
        this.unit.next.copy( movement );
        this.unit.updated = true;
        this.expire = Date.now() + expireTime;
    }

}

class Entities {

    constructor( game ) {
        this.game = game;
        this.list = new Map();
        this.pending = new Map();
    }

    // movement - protocol.Messaging.Messages.Movement.toObject()
    handleMovement( movement ) {

        if ( this.list.has( movement.id ) ) {

            let u = this.list.get( movement.id );
            u.unit.next.copy( movement );
            u.unit.updated = true;
            u.expire = Date.now() + expireTime;
            return;
        }

        if ( !this.pending.has( movement.id ) ) {
            // реквест на UnitInfo
            this.game.connect.sendUnitInfoRequest( movement.id );
        }

        this.pending.set( movement.id, movement );

    }

    // info - protocol.Messaging.Messages.UnitInfo.toObject()
    handleUnitInfo( info ) {

        if ( this.pending.has( info.id ) ) {

            let movement = this.pending.get( info.id );
            let n = new Entity( movement );

            if ( info.self ) {
                n.unit = this.game.player;
            }

            n.unit.setName( info.name );
            this.game.scene.add( n.unit.label );

            n.unit.modelId = info.modelId;
            n.unit.setMesh( this.game.models[ info.modelId ].clone() );
            n.unit.mesh.animations = this.game.models[ info.modelId ].animations;
            this.game.scene.add( n.unit.mesh );
            n.unit.mixer = new THREE.AnimationMixer( n.unit.mesh );
            n.unit.mixer.clipAction( n.unit.mesh.animations[ 0 ] ).play();

            this.list.set( info.id, n );
            log.appendText( `[entities] add ${movement.id}` );

        }

        /*
                if ( this.list.has( info.id ) ) {

                    let entity = this.list.get( info.id );

                    if ( info.self ) {
                        entity.unit = this.game.player;
                    }

                    //            let p = new Player( this.game.camera, this.game.models[ info.modelId ].clone() );
                    //            p.name = info.name;
                    //            p.modelId = info.modelId;
                    //            this.game.scene.add( p.mesh );
                    //            entity.unit = p;

                    entity.unit.name = info.name;
                    entity.unit.modelId = info.modelId;
                    entity.unit.setMesh( this.game.models[ info.modelId ].clone() );
                    this.game.scene.add( entity.unit.mesh );
                    this.game.scene.add( entity.unit.label );

                }
        */
    }

    removeExpired() {

        let now = Date.now();
        for ( let entry of this.list ) {
            if ( now > entry[ 1 ].expire ) {
                this.game.scene.remove( entry[ 1 ].unit.mesh );
                this.game.scene.remove( entry[ 1 ].unit.label );
                this.list.delete( entry[ 0 ] );
                log.appendText( `[entities] remove ${entry[ 0 ]}` );
            }
        }

    }

    moveEntities() {

        for ( let entity of this.list.values() ) {
            entity.unit.move();
        }

    }

    animate( multiplier ) {

        for ( let entity of this.list.values() ) {
            entity.unit.animate( multiplier );
            if ( entity.unit.mixer ) {
                entity.unit.mixer.update( 0.01 );
            }
        }

    }

}

export { Entities };
