class Controller {

    constructor(dom) {

        this.dom = dom;

        this.moveForward = false;
        this.moveBackward = false;

        this.moveLeft = false;
        this.moveRight = false;

        this.rotateLeft = false;
        this.rotateRight = false;

        this.zoomIn = false;
        this.zoomOut = false;

        this.modifiers = { shift: false, ctrl: false, alt: false, meta: false };

        function contextmenu(event) {
            event.preventDefault();
        }

        var controller = this;
        var _onKeyDown = function (event) { controller.onKeyChange(event, true); };
        var _onKeyUp = function (event) { controller.onKeyChange(event, false); };

        this.dom.addEventListener('contextmenu', contextmenu, false);
        window.addEventListener('keydown', _onKeyDown, false);
        window.addEventListener('keyup', _onKeyUp, false);
    }

    onKeyChange(event, pressed) {

        switch (event.keyCode) {

            // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

            case 87: this.moveForward = pressed; break;     // W
            case 83: this.moveBackward = pressed; break;    // S

            case 65: this.moveLeft = pressed; break;        // A
            case 68: this.moveRight = pressed; break;       // D

            case 81: this.rotateLeft = pressed; break;      // Q
            case 69: this.rotateRight = pressed; break;     // E

            case 33: this.zoomIn = pressed; break;          // PageUp
            case 34: this.zoomOut = pressed; break;         // PageDown

        };

        this.modifiers.shift = event.shiftKey;
        this.modifiers.ctrl = event.ctrlKey;
        this.modifiers.alt = event.altKey;
        this.modifiers.meta = event.metaKey;

    }

    dispose() {
        this.dom.removeEventListener('contextmenu', contextmenu, false);
        window.removeEventListener('keydown', _onKeyDown, false);
        window.removeEventListener('keyup', _onKeyUp, false);
    }

};

export { Controller };