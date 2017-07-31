import loglevel from 'loglevel';

// допустимый разброс запуска итераций
const scatter = 5;

const logger = loglevel.getLogger('loop');

class Loop {
  constructor(frequency, updater) {
    this.updater = updater;
    this.frequency = frequency;
    // this.interval = (1000 / frequency) | 0;
    this.interval = Math.floor(1000 / frequency);

    this.running = false;
    this.entry = undefined;
    this.ticker = undefined;

    this.ready = false;
    this.ok = 0;
    this.current = -1;

    // this.tick();
  }

  restart() {
    this.stop();
    this.entry = Date.now();
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
    if (this.ticker) {
      clearTimeout(this.ticker);
      this.ticker = undefined;
    }
  }

  tick() {
    this.start = Date.now();

    // offset - разница между расчетным и реальным временем начала тика
    // с учетом пропущенных тиков. Положительное значение при опоздании
    const offset = this.start - (this.entry + (this.current + 1) * this.interval);

    // const current = ((start - this.entry) / this.interval) | 0;
    const current = Math.floor((this.start - this.entry) / this.interval);

    // Проверка на то, что итерация запустилась слишком рано
    this.current = current === this.current ? current + 1 : current;

    // delta - разница между расчетным и реальным временем начала тика
    // без учета пропущенных тиков. Положительное значение при опоздании
    this.delta = this.start - (this.entry + this.current * this.interval);

    logger.debug(`Тик: ${this.current}, offset: ${offset}, delta: ${this.delta}`);

    if (!this.ready) {
      if (offset < scatter) {
        this.ok++;
        if (this.ok > this.frequency) {
          this.ready = true;
          logger.info('Тикер стабилизировался');
        }
      } else {
        this.ok = 0;
      }
    }

    if (this.ready) {
      this.updater();
    }

    this.busy = Date.now() - this.start;

    // Предположительная продолжительность тика
    this.duration = this.interval - this.busy - this.delta;

    this.ticker = setTimeout(() => {
      this.tick();
    }, this.duration);

    // logger.debug(`busy: ${this.busy}, duration: ${this.duration}`);
  }
}

export default Loop;
