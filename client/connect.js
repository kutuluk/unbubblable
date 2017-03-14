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


            /*
                        let msgContainer2 = this.protobuf.MessageContainer.create({ Messages: [msg] });
            
                        let buffer = this.protobuf.MessageContainer.encode(msgContainer2).finish();
            */

            //this.ws.send(buffer);

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


        //        let msg2M = this.protobuf.lookup("Controller");
        /*
                let msg2 = this.protobuf.Controller.create(
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
        */

        let msg2 = this.protobuf.Controller.create(
            {
                MoveForward2: true,
                MoveBackward2: true,
                MoveLeft2: true,
                MoveRight2: false,
                RotateLeft2: false,
                RotateRight: false,
                Mods: this.protobuf.Controller.Modifiers.create(
                    {
                        Shift2: true,
                        Ctrl2: true,
                        Alt2: false,
                        Meta: false
                    }
                )
            }
        );

        msg2.MoveLeft = true;

        console.log(msg2);
        let m = this.protobuf.Controller.encode(msg2).finish();
        console.log(m);

        let msgM = this.protobuf.lookup("Controller");

        var message = msgM.decode(m);
        console.log(message);
        var errMsg = this.protobuf.Controller.verify(msg2);
        if (errMsg)
            throw Error(errMsg);


        /*
                let msgItem2 = this.protobuf.MessageItem.create(
                    {
                        Type: this.protobuf.MessageType.MsgController,
                        Body: this.protobuf.Controller.encode(msg2).finish()
                    }
                );
        
                console.log(msg2);
                console.log(m.buffer);
        
                var errMsg = this.protobuf.Controller.verify(m);
                if (errMsg)
                    throw Error(errMsg);
        */
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