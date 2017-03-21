import { log } from './log';
//import * as protobuf from 'protobufjs';
import * as proto from './protocol.js';

class Connect {

    constructor(game) {

        this.game = game;

        /*
        protobuf.load('js/protocol.proto', (err, root) => {
            if (err) throw err;
            this.protobuf = root.lookup("protocol");
        });
        // Убрать эту тупую задержку в 1 секунду на загрузку js/protocol.proto
        let ms = 1000 + new Date().getTime();
        while (new Date() < ms) { }
        */

        this.protobuf = proto.default.protocol;
        console.log(this.protobuf);

        this.ws = new WebSocket(`ws://${window.location.host}/ws`);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            log.appendText('[WS] Соединение установлено.');
        };

        this.ws.onerror = error => {
            log.appendText(`[WS] Ошибка: ${error.message}`);
        };

        this.ws.onclose = event => {

            if (event.wasClean) {
                var text = 'Соединение закрыто чисто.';
            } else {
                var text = 'Обрыв соединения.';
            }
            // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
            log.appendText(`[WS] ${text} Код: ${event.code}`);

        };

        this.ws.onmessage = event => {

            // Преобразуем полученные данные в контейнер
            let msgContainer = this.protobuf.MessageContainer.decode(new Uint8Array(event.data)).toObject({ defaults: true });

            /*
            try {
                var msgContainer = this.protobuf.MessageContainer.decode(new Uint8Array(event.data)).toObject({ defaults: true });
            } catch (err) {
                log.appendText(`[proto read]: ${err}`);
                return;
            }
            */

            // Обходим сообщения в контейнере
            msgContainer.Messages.forEach(message => {

                switch (message.Type) {

                    case this.protobuf.Messaging.MessageType.MsgMovement:

                        // Декодируем сообщение
                        let msgMovement = this.protobuf.Movement.decode(message.Body).toObject({ defaults: true });
                        // Запускаем обработчик
                        this.game.handleMovementMessage(msgMovement);
                        break

                    case this.protobuf.Messaging.MessageType.MsgTerrain:

                        // Декодируем сообщение
                        let msgTerrain = this.protobuf.Terrain.decode(message.Body).toObject({ defaults: true });
                        // Запускаем обработчик
                        this.game.handleTerrainMessage(msgTerrain);
                        break

                    case this.protobuf.Messaging.MessageType.MsgChunk:

                        // Декодируем сообщение
                        let msgChunk = this.protobuf.Chunk.decode(message.Body).toObject({ defaults: true });
                        // Запускаем обработчик
                        this.game.handleChunkMessage(msgChunk);
                        break

                    default:
                        log.appendText('[proto read]: неизвестное сообщение');
                        break
                };

            });
        };
    }

    sendMessage(msg) {

        if (this.ws.readyState == WebSocket.OPEN) {

            // Создаем контейнер и добавляем в него сообщение
            let msgContainer = this.protobuf.MessageContainer.create(
                {
                    Messages: [msg]
                }
            );

            // Отправляем сообщение
            this.ws.send(this.protobuf.MessageContainer.encode(msgContainer).finish());

        }
    }


    sendController(controller) {

        // Формируем сообщение
        let msg = this.protobuf.Controller.create(
            {
                MoveForward: controller.moveForward,
                MoveBackward: controller.moveBackward,
                MoveLeft: controller.moveLeft,
                MoveRight: controller.moveRight,
                RotateLeft: controller.rotateLeft,
                RotateRight: controller.rotateRight,
                Mods: this.protobuf.Controller.Modifiers.create(
                    {
                        Shift: controller.modifiers.shift,
                        Ctrl: controller.modifiers.ctrl,
                        Alt: controller.modifiers.alt,
                        Meta: controller.modifiers.meta
                    }
                )
            }
        );

        // Упаковываем сообщение в элемент контейнера
        let msgItem = this.protobuf.MessageItem.create(
            {
                Type: this.protobuf.Messaging.MessageType.MsgController,
                Body: this.protobuf.Controller.encode(msg).finish()
            }
        );

        // Отправляем сообщение
        this.sendMessage(msgItem);

    }

    sendChanksRequest(chunksIndecies) {
        if (chunksIndecies.length > 0) {

            // Формируем сообщение
            let msg = this.protobuf.Messaging.Request.GetChunksRequest.create(
                {
                    chunks: chunksIndecies
                }
            );

            // Упаковываем сообщение в элемент контейнера
            let msgItem = this.protobuf.MessageItem.create(
                {
                    Type: this.protobuf.Messaging.MessageType.MsgChunkRequest,
                    Body: this.protobuf.Messaging.Request.GetChunksRequest.encode(msg).finish()
                }
            );

            // Отправляем сообщение
            this.sendMessage(msgItem);

        }
    }

};

export { Connect };