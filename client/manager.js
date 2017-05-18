import log from './log'

class Manager {
  constructor () {
    this.canvas = !!window.CanvasRenderingContext2D
    if (!this.canvas) {
      log.appendText('[ERROR] Браузер не поддерживает Canvas.')
    }

    this.webgl = false
    if (this.canvas) {
      let canvas = document.createElement('canvas')
      this.webgl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
    }
    if (!this.webgl) {
      log.appendText('[ERROR] Браузер не поддерживает WebGL.')
    }

    this.websocket = !!window.WebSocket
    if (!this.websocket) {
      log.appendText('[ERROR] Браузер не поддерживает WebSockets.')
    }

    this.workers = !!window.Worker
    this.fileapi = !!(window.File && window.FileReader && window.FileList && window.Blob)

    this.windowLoad = false
    this.fontLoad = false
  }

  require () {
    return this.canvas && this.webgl && this.websocket
  }

  check () {
    if (this.require() && this.fontLoad && this.windowLoad) {
      this.onready()
    }
  }

  windowload () {
    this.windowLoad = true
    this.check()
  }

  fontload (ok) {
    if (ok) {
      this.fontLoad = true
      this.check()
    } else {
      log.appendText('[ERROR] Ошибка загрузки шрифта.')
      this.onfail()
    }
  }
}

export default new Manager()
