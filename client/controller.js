import chat from './chat';

class Controller {
  constructor(dom) {
    this.clear();

    dom.addEventListener('contextmenu', event => event.preventDefault(), false);
    window.addEventListener('keydown', event => this.onKeyChange(event, true), false);
    window.addEventListener('keyup', event => this.onKeyChange(event, false), false);

    /*
    // Если потом необходимо очищать обработчики с помощью dispose()

    this.dom = dom;

    this._contextmenu = event => event.preventDefault();
    this._onKeyDown = event => this.onKeyChange(event, true);
    this._onKeyUp = event => this.onKeyChange(event, false);

    this.dom.addEventListener('contextmenu', this._contextmenu, false);
    window.addEventListener('keydown', this._onKeyDown, false);
    window.addEventListener('keyup', this._onKeyUp, false);
    */
  }

  /*
  dispose() {
    this.dom.removeEventListener('contextmenu', this._contextmenu, false);
    window.removeEventListener('keydown', this._onKeyDown, false);
    window.removeEventListener('keyup', this._onKeyUp, false);
  }
  */

  clear() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.rotateLeft = false;
    this.rotateRight = false;
    this.zoomIn = false;
    this.zoomOut = false;
    this.modifiers = { shift: false, ctrl: false, alt: false, meta: false };
  }

  onKeyChange(event, pressed) {
    if (event.target === document.body) {
      switch (event.keyCode) {
        // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
        // http://keycode.info/

        case 13:
          if (pressed) {
            this.clear();
            chat.focus();
          }
          break;

        case 87:
          this.moveForward = pressed;
          break; // W

        case 83:
          this.moveBackward = pressed;
          break; // S

        case 65:
          this.moveLeft = pressed;
          break; // A

        case 68:
          this.moveRight = pressed;
          break; // D

        case 81:
          this.rotateLeft = pressed;
          break; // Q

        case 69:
          this.rotateRight = pressed;
          break; // E

        case 33:
          this.zoomIn = pressed;
          break; // PageUp

        case 34:
          this.zoomOut = pressed;
          break; // PageDown
      }

      this.modifiers.shift = event.shiftKey;
      this.modifiers.ctrl = event.ctrlKey;
      this.modifiers.alt = event.altKey;
      this.modifiers.meta = event.metaKey;
    }
  }
}

export default Controller;
