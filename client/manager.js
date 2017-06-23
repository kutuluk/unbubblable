import loglevel from 'loglevel';

const logger = loglevel.getLogger('manager');

class Manager {
  constructor(onReady, onFail) {
    this.hasCanvas = !!window.CanvasRenderingContext2D;
    if (!this.hasCanvas) {
      logger.error('Браузер не поддерживает Canvas.');
    }

    this.hasWebGL = false;
    if (this.hasCanvas) {
      const canvas = document.createElement('canvas');
      this.hasWebGL = !!(window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }
    if (!this.hasWebGL) {
      logger.error('Браузер не поддерживает WebGL.');
    }

    this.hasWebSocket = !!window.WebSocket;
    if (!this.hasWebSocket) {
      logger.error('Браузер не поддерживает WebSockets.');
    }

    this.hasWorkers = !!window.Worker;
    this.hasFileAPI = !!(window.File && window.FileReader && window.FileList && window.Blob);
    this.hasLocalStorage = !!window.localStorage;

    this.windowLoad = false;
    this.fontLoad = false;

    this.onReady = onReady;
    this.onFail = onFail;
  }

  require() {
    return this.hasCanvas && this.hasWebGL && this.hasWebSocket;
  }

  check() {
    if (this.require() && this.fontLoad && this.windowLoad) {
      this.onReady();
    }
  }

  windowload() {
    this.windowLoad = true;
    this.check();
  }

  fontload(ok) {
    if (ok) {
      this.fontLoad = true;
      this.check();
    } else {
      logger.error('Ошибка загрузки шрифта.');
      this.onFail();
    }
  }
}

export default Manager;
