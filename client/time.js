class Timestamp {
  constructor (seconds, nanos) {
    this.seconds = seconds
    this.nanos = nanos
  }

  milliseconds () {
    return this.seconds * 1000 + ((this.nanos / 1000000) | 0)
  }
}

class Time {
  constructor () {
    this.now = performance ? this.nowPerformance : Date.now
    this.date = performance.timing.navigationStart ? this.datePerformance : Date.now
  }

  nowPerformance () {
    return performance.now()
  }

  datePerformance () {
    return performance.now() + performance.timing.navigationStart
  }

  timestamp () {
    let date = this.date()
    let seconds = (date / 1000) | 0
    let nanos = ((date - seconds * 1000) * 1000000) | 0
    return new Timestamp(seconds, nanos)
  }
}

let time = new Time()

export { time }
