import { log } from './log';
import * as protobuf from 'protobufjs';

class Connect {

    constructor(game) {

        this.game = game;

        this.proto = dcodeIO.ProtoBuf.loadProtoFile('./js/protocol.proto').build('protocol');

        protobuf.load('js/protocol.proto', (err, root) => {
            if (err) throw err;
            this.protobuf = root;

            this.protobuf = root.lookup("protocol");
            console.log(this.protobuf);

        });


        //        var ChunkRequest = this.protobuf.lookup("protocol.ChunkRequest");
        //        var message = ChunkRequest.create();
        //        console.log(message);

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
            msgContainer.Messages.forEach(message => {

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

            // ------------------

            let msgContainerM = this.protobuf.lookup("MessageContainer");
            let msgContainer2 = msgContainerM.create({ Messages: [msg] });

            //            var errMsg = msgContainerM.verify(msgContainer2);
            //            if (errMsg)
            //                throw Error(errMsg);

            let buffer = msgContainerM.encode(msgContainer2).finish();

            //            let msgContainer2 = this.protobuf.MessageContainer.create({ Messages: [msg] });
            //            let buffer = this.protobuf.MessageContainer.encode(msgContainer2).finish();
            //            console.log(msgContainer2);


            //            this.ws.send(buffer);

            //            let msgContainer3 = this.protobuf.lookup("MessageContainer");
            //            let msgContainer4 = new msgContainer3;
            //            msgContainer4.Messages.push(msg);

            //            msgContainer2.Messages.push([msg]);

            // ------------------

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

        let msg2M = this.protobuf.lookup("Controller");
        let msg2 = msg2M.create({
            MoveForward: controller.moveForward,
            MoveBackward: controller.moveBackward,
            MoveLeft: controller.moveLeft,
            MoveRight: controller.moveRight,
            RotateLeft: controller.rotateLeft,
            RotateRight: controller.rotateRight,
            Modifiers: {
                Shift: controller.modifiers.shift,
                Ctrl: controller.modifiers.ctrl,
                Alt: controller.modifiers.alt,
                Meta: controller.modifiers.meta
            }
        });

        console.log(msg2);


        let msgItemM = this.protobuf.lookup("MessageItem");
        let msgItem2 = msgItemM.create(msg2);

//        console.log(msgItem2);

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