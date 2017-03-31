import { log } from './log';

class Loop {

    constructor( amplitude, updater ) {

        this.updater = updater;
        this.amplitude = amplitude;
        this.interval = 1000 / this.amplitude | 0;
        this.entry = new Date().getTime();

        this.tick();

    }

    tick() {

        this.start = new Date().getTime();
        let current = ( this.start - this.entry ) / this.interval | 0;

        // Проверка на то, что итерация запустилась слишком рано
        this.current = ( current == this.current ) ? current + 1 : current;

        this.delta = this.entry + this.current * this.interval - this.start;
        // Предположительная продолжительность тика
        this.duration = this.interval + this.delta;

        //        log.appendText( `[Tick]: current: ${this.current}, delta ${this.delta}` );

        this.updater();

        this.busy = new Date().getTime() - this.start;
        this.ticker = setTimeout( () => { this.tick(); }, this.interval - this.busy + this.delta );

    }

}

export { Loop };
