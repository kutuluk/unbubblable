import { log } from './log';
import * as proto from './protocol.js';

class Connect {

    constructor(game) {

        this.game = game;

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
                        let msgMovement = this.protobuf.Messaging.Messages.Movement.decode(message.Body).toObject({ defaults: true });
                        // Запускаем обработчик
                        this.game.handleMovementMessage(msgMovement);
                        break

                    case this.protobuf.Messaging.MessageType.MsgTerrain:

                        // Декодируем сообщение
                        let msgTerrain = this.protobuf.Messaging.Messages.Terrain.decode(message.Body).toObject({ defaults: true });
                        // Запускаем обработчик
                        this.game.handleTerrainMessage(msgTerrain);
                        break

                    case this.protobuf.Messaging.MessageType.MsgChunk:

                        // Декодируем сообщение
                        let msgChunk = this.protobuf.Messaging.Response.GetChunksResponse.decode(message.Body).toObject({ defaults: true });
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
        let msg = this.protobuf.Messaging.Messages.ApplyControllerMessage.create(
            {
                moveForward: controller.moveForward,
                moveBackward: controller.moveBackward,
                moveLeft: controller.moveLeft,
                moveRight: controller.moveRight,
                rotateLeft: controller.rotateLeft,
                rotateRight: controller.rotateRight,
                mods: this.protobuf.Messaging.Messages.ApplyControllerMessage.Modifiers.create(
                    {
                        shift: controller.modifiers.shift,
                        ctrl: controller.modifiers.ctrl,
                        alt: controller.modifiers.alt,
                        meta: controller.modifiers.meta
                    }
                )
            }
        );

        // Упаковываем сообщение в элемент контейнера
        let msgItem = this.protobuf.MessageItem.create(
            {
                Type: this.protobuf.Messaging.MessageType.MsgController,
                Body: this.protobuf.Messaging.Messages.ApplyControllerMessage.encode(msg).finish()
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