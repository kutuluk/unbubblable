import { time } from './time';
import { log } from './log';
import * as proto from './protocol.js';

class Connect {

    constructor( game ) {

        this.game = game;

        this.protobuf = proto.default.protocol;

        this.ws = new WebSocket( `ws://${window.location.host}/ws` );
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            log.appendText( '[WS] Соединение установлено.' );
        };

        this.ws.onerror = error => {
            log.appendText( `[WS] Ошибка: ${error.message}` );
        };

        this.ws.onclose = event => {

            let text = '';
            if ( event.wasClean ) {
                text = 'Соединение закрыто чисто.';
            } else {
                text = 'Обрыв соединения.';
            }
            // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
            log.appendText( `[WS] ${text} Код: ${event.code}` );

        };

        this.ws.onmessage = event => {

            /*
            try {
                var msgContainer = this.protobuf.MessageContainer.decode(new Uint8Array(event.data)).toObject({ defaults: true });
            } catch (err) {
                log.appendText(`[proto read]: ${err}`);
                return;
            }
            */

            // Декодируем сообщение
            let message = this.protobuf.Messaging.Message.decode( new Uint8Array( event.data ) ).toObject( { defaults: true } );
            // Обрабатываем сообщение
            this.handleMessage( message );

        };
    }

    handleMessage( message ) {

        switch ( message.type ) {

        case this.protobuf.Messaging.MessageType.MsgChain:

            // Декодируем сообщение
            let msgChain = this.protobuf.Messaging.MessageChain.decode( message.body ).toObject( { defaults: true } );
            // Запускаем обработчик для всех сообщений в цепочке
            msgChain.chain.forEach( message => this.handleMessage( message ) );
            break;

        case this.protobuf.Messaging.MessageType.MsgMovement:

            // Декодируем сообщение
            let msgMovement = this.protobuf.Messaging.Messages.Movement.decode( message.body ).toObject( { defaults: true } );
            // Запускаем обработчик
            this.game.handleMovementMessage( msgMovement );
            break;

        case this.protobuf.Messaging.MessageType.MsgTerrain:

            // Декодируем сообщение
            let msgTerrain = this.protobuf.Messaging.Messages.Terrain.decode( message.body ).toObject( { defaults: true } );
            // Запускаем обработчик
            this.game.handleTerrainMessage( msgTerrain );
            break;

        case this.protobuf.Messaging.MessageType.MsgChunk:

            // Декодируем сообщение
            let msgChunk = this.protobuf.Messaging.Response.GetChunksResponse.decode( message.body ).toObject( { defaults: true } );
            // Запускаем обработчик
            this.game.handleChunkMessage( msgChunk );
            break;

        case this.protobuf.Messaging.MessageType.MsgPingRequest:

            // Отвечаем на пинг
            this.sendPingResponse();
            break;

        default:

            log.appendText( '[proto read]: неизвестное сообщение' );
            break;

        }

    }

    // Отправляет одно сообщение, упакованное в цепочку
    sendChain( type, body ) {

        // Упаковываем данные в сообщение
        let message = this.protobuf.Messaging.Message.create( {
            type: type,
            body: body
        } );

        // Создаем контейнер и добавляем в него сообщение
        let chain = this.protobuf.Messaging.MessageChain.create( {
            chain: [ message ]
        } );

        // Отправляем сообщение
        this.sendMessage( this.protobuf.Messaging.MessageType.MessageChain, this.protobuf.Messaging.MessageChain.encode( chain ).finish() );

    }

    // Отправляет одно сообщение
    sendMessage( type, body ) {

        if ( this.ws.readyState == WebSocket.OPEN ) {

            // Упаковываем данные в сообщение
            let message = this.protobuf.Messaging.Message.create( {
                type: type,
                body: body
            } );

            // Отправляем сообщение
            this.ws.send( this.protobuf.Messaging.Message.encode( message ).finish() );

        }

    }

    sendController( controller ) {

        // Формируем сообщение
        let msg = this.protobuf.Messaging.Messages.ApplyControllerMessage.create( {
            moveForward: controller.moveForward,
            moveBackward: controller.moveBackward,
            moveLeft: controller.moveLeft,
            moveRight: controller.moveRight,
            rotateLeft: controller.rotateLeft,
            rotateRight: controller.rotateRight,
            mods: this.protobuf.Messaging.Messages.ApplyControllerMessage.Modifiers.create( {
                shift: controller.modifiers.shift,
                ctrl: controller.modifiers.ctrl,
                alt: controller.modifiers.alt,
                meta: controller.modifiers.meta
            } )
        } );

        // Отправляем сообщение
        this.sendMessage( this.protobuf.Messaging.MessageType.MsgController, this.protobuf.Messaging.Messages.ApplyControllerMessage.encode( msg ).finish() );

    }

    sendChanksRequest( indecies ) {

        if ( indecies.length > 0 ) {

            // Формируем сообщение
            let msg = this.protobuf.Messaging.Request.GetChunksRequest.create( {
                chunks: indecies
            } );

            // Отправляем сообщение
            this.sendMessage( this.protobuf.Messaging.MessageType.MsgChunkRequest, this.protobuf.Messaging.Request.GetChunksRequest.encode( msg ).finish() );
        }

    }

    sendPingResponse() {

        let now = time.timestamp();

        // Формируем сообщение
        let msg = this.protobuf.Messaging.Response.PingResponse.create( {
            time: this.protobuf.Data.Timestamp.create( {
                seconds: now.seconds,
                nanos: now.nanos
            } )
        } );

        // Отправляем сообщение
        this.sendMessage( this.protobuf.Messaging.MessageType.MsgPingResponse, this.protobuf.Messaging.Response.PingResponse.encode( msg ).finish() );

    }
}

export { Connect };
