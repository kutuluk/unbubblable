import { log } from './log';

class Loop {

    constructor( game, amplitude ) {

        this.game = game;
        this.current = 0;
        this.time = new Date().getTime();
        this.amplitude = amplitude;
        this.interval = 1000 / this.amplitude;
        this.updating = false;
        this.delta = 0;
        this.tickerId = setTimeout( this.tick.bind( this ), this.interval );

    }

    tick() {

        this.updating = true;

        // Увеличиваем номер текущего тика
        this.current += 1;

        let now = new Date().getTime();
        let duration = now - this.time;

        this.delta = this.delta + this.interval - duration;
        //		this.delta = this.delta - (this.delta / this.interval |0) * this.interval;
        this.tickerId = setTimeout( this.tick.bind( this ), this.interval + this.delta );

        // Обновляем момент начала текущего тика
        this.time = now;

        if ( duration < 45 || duration > 55 ) {
            log.appendText( `[Tick]: duration: ${duration}, delta ${this.delta}` );
        }

        this.game.player.camHeight += this.game.player.camMotion;
        this.game.player.camMotion = 0;

        // Передвигаем игрока
        if ( this.game.player.unit.next ) {
            this.game.player.unit.movement.copy( this.game.player.unit.next );
            this.game.player.unit.next = undefined;
        } else {
            this.game.player.unit.movement.position.add( this.game.player.unit.movement.motion );
            this.game.player.unit.movement.motion = new THREE.Vector3( 0, 0, 0 );
            this.game.player.unit.movement.angle = this.game.player.unit.movement.slew;
            this.slew = 0;
        }

        if ( this.game.controller.zoomIn ) {
            this.game.player.camMotion -= 0.5;
        }

        if ( this.game.controller.zoomOut ) {
            this.game.player.camMotion += 0.5;
        }

        if ( this.game.controller.modifiers.shift ) {
            this.game.player.camMotion *= 0.25;
        }

        this.updating = false;

        this.game.connect.sendController( this.game.controller );


        if ( !( this.game.terrain === undefined || this.game.terrain === null ) ) {
            let indecies = [];
            let cx = Math.floor( this.game.player.unit.movement.position.x / this.game.terrain.chunkSize );
            let cy = Math.floor( this.game.player.unit.movement.position.y / this.game.terrain.chunkSize );
            // Перебор 9 смежных чанков
            for ( let y = cy - 1; y < cy + 2; y++ ) {
                for ( let x = cx - 1; x < cx + 2; x++ ) {
                    // Проверка на допустимый диапазон
                    if ( ( y >= 0 ) && ( y < this.game.terrain.chunkedHeight ) && ( x >= 0 ) && ( x < this.game.terrain.chunkedWidth ) ) {
                        let index = y * this.game.terrain.chunkedWidth + x;
                        // Добавление индекса чанка в список запроса в случае его отсутствия
                        if ( this.game.terrain.chunks[ index ] === undefined ) {
                            indecies.push( index );
                        }
                    }
                }
            }

            this.game.connect.sendChanksRequest( indecies );
        }

    }

}

export { Loop };
