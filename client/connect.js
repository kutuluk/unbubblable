import { log } from './log';

function Connect(delay, game) {

    this.delay = delay || 0;
    this.game = game;

    //        var ProtoBuf = dcodeIO.ProtoBuf;
    //        var builder = ProtoBuf.loadProtoFile("./js/protocol.proto");
    //        var Proto = builder.build("protocol");
    this.proto = dcodeIO.ProtoBuf.loadProtoFile("./js/protocol.proto").build("protocol");

    var connect = this;

    this.ws = new WebSocket("ws://" + window.location.host + "/ws");
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = function () {
        log.appendText("[WS] Соединение установлено.");
    };

    this.ws.onerror = function (error) {
        log.appendText("[WS] Ошибка: " + error.message);
    };

    this.ws.onclose = function (event) {
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

    this.ws.onmessage = function (event) {
        // Преобразуем полученные данные в контейнер
        try {
            var msgContainer = connect.proto.MessageContainer.decode(event.data);
        } catch (err) {
            log.appendText("[proto read]: " + err);
            return;
        }

        // Обходим сообщения в контейнере
        msgContainer.Messages.forEach(function (message) {

            switch (message.Type) {

                // PlayerPosition
                case connect.proto.MessageType.MsgPlayerPosition:

                    try {
                        // Декодируем сообщение
                        var msgPlayerPosition = connect.proto.PlayerPosition.decode(message.Body);

                        // Применяем сообщение
                        game.echo.next.position.x = msgPlayerPosition.Position.X;
                        game.echo.next.position.y = msgPlayerPosition.Position.Y;
                        game.echo.next.position.z = msgPlayerPosition.Position.Z;
                        game.echo.next.motion.x = msgPlayerPosition.Motion.X;
                        game.echo.next.motion.y = msgPlayerPosition.Motion.Y;
                        game.echo.next.motion.z = msgPlayerPosition.Motion.Z;
                        game.echo.next.angle = msgPlayerPosition.Angle;
                        game.echo.next.slew = msgPlayerPosition.Slew;
                    } catch (err) {
                        log.appendText("[proto read]: " + err);
                    };

                    break

                // Terrain
                case connect.proto.MessageType.MsgTerrain:

                    try {
                        // Декодируем сообщение
                        var msgTerrain = connect.proto.Terrain.decode(message.Body);
                    } catch (err) {
                        log.appendText("[proto read]: " + err);
                    };

                        // Применяем сообщение
                        game.terrain = msgTerrain;
                        game.createTerrain();

                    break

                // Terrain
                case connect.proto.MessageType.MsgChunk:

                    try {
                        // Декодируем сообщение
                        var msgChunk = connect.proto.Chunk.decode(message.Body);
                    } catch (err) {
                        log.appendText("[proto read]: " + err);
                    };

                        // Применяем сообщение
                        //game.terrain = msgTerrain;
                        //game.createTerrain();

                    break

                default:
                    log.appendText("[proto read]: не известное сообщение");
                    break
            };

        });
    };
};

Connect.prototype = {

    constructor: Connect,

    sendMessage: function (msg) {
        if (this.ws.readyState == WebSocket.OPEN) {
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

            // Формируем сообщение
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

            // Упаковываем сообщение в элемент контейнера
            var msgItem = new this.proto.MessageItem(
                this.proto.MessageType.MsgController,
                msg.encode()
            );

            // Создаем контейнер и добавляем в него сообщение
            var msgContainer = new this.proto.MessageContainer;
            msgContainer.Messages.push(msgItem);

            // Отправляем сообщение
            this.ws.send(msgContainer.toArrayBuffer());
        }
    }

}

export { Connect };

