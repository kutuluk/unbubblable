class Timestamp {
  constructor(seconds, nanos) {
    this.seconds = seconds || 0;
    this.nanos = nanos || 0;
  }

  milliseconds() {
    return this.seconds * 1000 + Math.floor(this.nanos / 1000000);
  }
}

const now =
  Date.now ||
  function now() {
    return new Date().getTime();
  };

let offset = now();
if (performance) {
  let t = offset;
  // Ожидание начала следующей миллисекунды
  for (; t === offset; t = now());
  offset = t - performance.now();
}

/*
const offset = performance.timing && performance.timing.navigationStart
  ? performance.timing.navigationStart
  : now();
*/

const perf = function perf() {
  return now() - offset;
};

const perfNow = function perfNow() {
  return performance.now() + offset;
};

class Time {
  constructor() {
    this.perf = performance ? performance.now : perf;
    this.now = performance ? perfNow : now;
  }

  iso(t) {
    const n = t || this.now();
    const d = Math.floor(n);
    const m = `${(n - d).toFixed(3)}`.slice(2, 5);
    const str = new Date(d).toISOString();
    return `${str.slice(0, -1) + m}Z`;
  }

  timestamp(date = this.now()) {
    const seconds = Math.floor(date / 1000);
    const nanos = Math.floor((date - seconds * 1000) * 1000000);
    return new Timestamp(seconds, nanos);
  }
}

export default new Time();
