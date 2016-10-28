import { log } from './log';

//var myProtocol = require('./proto/protocol_pb');
//var protobuf = proto.protocol;

function Connect(delay, game) {

    this.delay = delay || 0;
    this.game = game;
    this.proto = dcodeIO.ProtoBuf.loadProtoFile("./js/protocol.proto").build("protocol");

//    this.connected = false;
    var connect = this;

    if (window["WebSocket"]) {

        this.ws = new WebSocket("ws://" + window.location.host + "/ws");
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = function () {
//            connect.connected = true;
            log.appendText("[WS] Соединение установлено.");
        };

        this.ws.onerror = function (error) {
            log.appendText("[WS] Ошибка: " + error.message);
        };

        this.ws.onclose = function (event) {
//            connect.connected = false;
            var text = "[WS] ";
            if (event.wasClean) {
                text += 'Соединение закрыто чисто.';
            } else {
                text += 'Обрыв соединения.';
            }
            // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
            text += 'Код: ' + event.code;
            log.appendText(text);
        };

        this.ws.onmessage = function (evt) {
            /*
        var msg = JSON.parse(evt.data);

        game.echo.next.position.x = msg.Position[0];
        game.echo.next.position.y = msg.Position[1];
        game.echo.next.position.z = msg.Position[2];
        game.echo.next.motion.x = msg.Motion[0];
        game.echo.next.motion.y = msg.Motion[1];
        game.echo.next.motion.z = msg.Motion[2];
        game.echo.next.angle = msg.Angle;
        game.echo.next.slew = msg.Slew;
*/
        try {
            // Decode the Message
            var msg = connect.proto.PlayerPosition.decode(evt.data);

        game.echo.next.position.x = msg.Position.X;
        game.echo.next.position.y = msg.Position.Y;
        game.echo.next.position.z = msg.Position.Z;
        game.echo.next.motion.x = msg.Motion.X;
        game.echo.next.motion.y = msg.Motion.Y;
        game.echo.next.motion.z = msg.Motion.Z;
        game.echo.next.angle = msg.Angle;
        game.echo.next.slew = msg.Slew;
            
//            log.appendText("[PROTO READ: ] " +JSON.stringify(msg));
        } catch (err) {
            log.appendText("[PROTO READ error: ] " + err);
        }
    };
        

    } else {
        log.appendText("[WS] Браузер не поддерживает WebSockets.");
    }
}

Connect.prototype = {

    constructor: Connect,

    sendMessage: function (msg) {
        if (this.ws.readyState == WebSocket.OPEN) {
//        if (this.connected) {
            if (this.delay > 0) {
                var connect = this;
                setTimeout(function () { connect.ws.send(msg); }, this.delay + Math.floor(Math.random() * this.delay / 10) - Math.floor(this.delay / 20));
            } else {
                this.ws.send(msg);
            }
        }
    },

    sendController: function (controller) {
        if (this.ws.readyState == WebSocket.OPEN) {

//        var ProtoBuf = dcodeIO.ProtoBuf;
//        var builder = ProtoBuf.loadProtoFile("./js/protocol.proto");
//        var Proto = builder.build("protocol");

        // Формируем сообщение на сервер
            var msg = new this.proto.Controller(
                controller.moveForward,
                controller.moveBackward,
                controller.moveLeft,
                controller.moveRight,
                controller.rotateLeft,
                controller.rotateRight,
                new this.proto.Controller.Modifiers(
                    controller.modifiers.shift,
                    controller.modifiers.ctrl,
                    controller.modifiers.alt,
                    controller.modifiers.meta)
            );

            this.ws.send(msg.toArrayBuffer());
        }
    }

}

export { Connect };

