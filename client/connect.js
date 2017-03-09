import { log } from './log';

class Connect {

    constructor(game) {

        this.game = game;

        //        var ProtoBuf = dcodeIO.ProtoBuf;
        //        var builder = ProtoBuf.loadProtoFile("./js/protocol.proto");
        //        var Proto = builder.build("protocol");
        this.proto = dcodeIO.ProtoBuf.loadProtoFile('./js/protocol.proto').build('protocol');

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
            try {
                var msgContainer = this.proto.MessageContainer.decode(event.data);
            } catch (err) {
                log.appendText(`[proto read]: ${err}`);
                return;
            }

            // Обходим сообщения в контейнере
            msgContainer.Messages.forEach( message => {

                switch (message.Type) {

                    // PlayerPosition
                    case this.proto.MessageType.MsgPlayerPosition:

                        try {
                            // Декодируем сообщение
                            var msgPlayerPosition = this.proto.PlayerPosition.decode(message.Body);
                        } catch (err) {
                            log.appendText(`[proto read]: ${err}`);
                            break
                        };

                        // Запускаем обработчик
                        this.game.handlePlayerPositionMessage(msgPlayerPosition);
                        break

                    // Terrain
                    case this.proto.MessageType.MsgTerrain:

                        try {
                            // Декодируем сообщение
                            var msgTerrain = this.proto.Terrain.decode(message.Body);
                        } catch (err) {
                            log.appendText(`[proto read]: ${err}`);
                            break
                        };

                        // Запускаем обработчик
                        this.game.handleTerrainMessage(msgTerrain);
                        break

                    // Chunk
                    case this.proto.MessageType.MsgChunk:

                        try {
                            // Декодируем сообщение
                            var msgChunk = this.proto.Chunk.decode(message.Body);
                        } catch (err) {
                            log.appendText(`[proto read]: ${err}`);
                            break
                        };

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
            let msgContainer = new this.proto.MessageContainer;
            msgContainer.Messages.push(msg);

            // Отправляем сообщение
            this.ws.send(msgContainer.toArrayBuffer());

        }
    }

    sendController(controller) {

        // Формируем сообщение
        let msg = new this.proto.Controller(
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
        let msgItem = new this.proto.MessageItem(
            this.proto.MessageType.MsgController,
            msg.encode()
        );

        // Отправляем сообщение
        this.sendMessage(msgItem);

    }

    sendChanksRequest(chunksIndecies) {
        if (chunksIndecies.length > 0) {

            // Формируем сообщение
            let msg = new this.proto.ChunkRequest();
            msg.Chunks = chunksIndecies;

            // Упаковываем сообщение в элемент контейнера
            let msgItem = new this.proto.MessageItem(
                this.proto.MessageType.MsgChunkRequest,
                msg.encode()
            );

            // Отправляем сообщение
            this.sendMessage(msgItem);

        }
    }

};

export { Connect };