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

/*
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
*/
// -----
console.log(message);
                        let msgPlayerPosition = this.protobuf.PlayerPosition.decode(message.Body.buffer);
                        // Запускаем обработчик
                        this.game.handlePlayerPositionMessage(msgPlayerPosition.toObject());
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

    sendMessage2(msg) {
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


        /* Старое API
        
                // Формируем сообщение
                let msg = new this.proto.Controller(
                    {
                        MoveForward: controller.moveForward,
                        MoveBackward: controller.moveBackward,
                        MoveLeft: controller.moveLeft,
                        MoveRight: controller.moveRight,
                        RotateLeft: controller.rotateLeft,
                        RotateRight: controller.rotateRight,
                        Mods: new this.proto.Controller.Modifiers(
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
                let msgItem = new this.proto.MessageItem(
                    this.proto.MessageType.MsgController,
                    msg.encode()
                );
        
                // Отправляем сообщение
                this.sendMessage(msgItem);
        
        */
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
                Type: this.protobuf.MessageType.MsgController,
                Body: this.protobuf.Controller.encode(msg).finish()
            }
        );

        // Отправляем сообщение
        this.sendMessage2(msgItem);

    }

    sendChanksRequest(chunksIndecies) {
        if (chunksIndecies.length > 0) {

            /* Старое API
    
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
    */

            // Формируем сообщение
            let msg = this.protobuf.ChunkRequest.create(
                {
                    Chunks: [chunksIndecies]
                }
            );

            // Упаковываем сообщение в элемент контейнера
            let msgItem = this.protobuf.MessageItem.create(
                {
                    Type: this.protobuf.MessageType.MsgChunkRequest,
                    Body: this.protobuf.ChunkRequest.encode(msg).finish()
                }
            );

            // Отправляем сообщение
            this.sendMessage2(msgItem);

        }
    }

};

export { Connect };