import { log } from './log';
import { Unit, Movement } from './unit';

const expireTime = 1000;

class Entity {

    constructor( movement ) {
        this.unit = new Unit();
        this.unit.next = new Movement( movement );
        this.expire = Date.now() + expireTime;
        this.updated = false;
    }

}

class Entities {

    constructor() {
        this.list = new Map();
    }

    // movement - protocol.Messaging.Messages.Movement.toObject()
    updateMovement( movement ) {
        if ( this.list.has( movement.id ) ) {
            let u = this.list.get( movement.id );

            u.unit.next.copy( movement );
            u.expire = Date.now() + expireTime;
            u.updated = true;

            this.list.set( movement.id, u );
        } else {
            let n = new Entity( movement );
            this.list.set( movement.id, n );
            log.appendText( `[entities] add ${movement.id}` );
            // реквест на UnitInfo
        }
    }

    removeExpired() {
        let now = Date.now();

        for ( let entity of this.list ) {
            if ( now > entity[ 1 ].expire ) {
                this.list.delete( entity[ 0 ] );
                log.appendText( `[entities] remove ${entity[ 0 ]}` );
            }
        }
    }

}

export { Entities };
