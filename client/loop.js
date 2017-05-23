// import log from './log'

// допустимый разброс запуска итераций
// const scatter = 5

class Loop {
  constructor(frequency, updater) {
    this.updater = updater;
    this.frequency = frequency;
    this.interval = (1000 / this.frequency) | 0;
    this.entry = Date.now();

    this.tick();
  }

  tick() {
    this.start = Date.now();
    const current = ((this.start - this.entry) / this.interval) | 0;

    // Проверка на то, что итерация запустилась слишком рано
    this.current = current === this.current ? current + 1 : current;

    this.delta = this.entry + this.current * this.interval - this.start;
    // Предположительная продолжительность тика
    this.duration = this.interval + this.delta;

    //        log.appendText( `[Tick]: current: ${this.current}, delta ${this.delta}` );

    this.updater();

    this.busy = Date.now() - this.start;
    this.ticker = setTimeout(() => {
      this.tick();
    }, this.interval - this.busy + this.delta);
  }
}

export default Loop;
