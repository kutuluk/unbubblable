import loglevel from 'loglevel';
// Скомпилированное описание протокола в формате json
import protobufjs from 'protobufjs';
import protocolJSON from './protocol-json';
// Скомпилированный модуль
// import protocol from './protocol'

import time from './time';

const logger = loglevel.getLogger('connect');
const wsLogger = loglevel.getLogger('websocket');

class Connect {
  constructor(game) {
    this.game = game;

    // Скомпилированный json
    this.protobuf = protobufjs.Root.fromJSON(protocolJSON).lookup('protocol');

    // Скомпилированный модуль
    //    this.protobuf = protocol.protocol

    this.ping = 0;

    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      wsLogger.info('Соединение успешно установлено');
    };

    ws.onerror = () => {
      // WebSockets не имеют нормальной обработки ошибок. Все ошибки приводят к закрытию соединения
      // и вызову обработчика onclose
      // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
      // Этот код по идее не должен исполняться ни когда
      wsLogger.error('Произошла какая-то ошибка');
    };

    ws.onclose = (event) => {
      // if (event.code === 1000) {
      if (event.wasClean) {
        wsLogger.info('Соединение закрыто чисто');
      } else {
        // https://tools.ietf.org/html/rfc6455#section-7.4
        wsLogger.error(`Обрыв соединения c кодом ${event.code}`);
      }
      this.game.loop.stop();
    };

    ws.onmessage = (event) => {
      const msgTime = time.now();
      try {
        // Декодируем сообщение
        const msg = this.protobuf.Messaging.Message.decode(new Uint8Array(event.data));
        //          .toObject({ defaults: true });
        // Обрабатываем сообщение
        this.handleMessage(msg, msgTime);
      } catch (err) {
        logger.error(err.message);
        throw err;
      }
    };

    this.ws = ws;
  }

  handleMessage(message, msgTime) {
    switch (message.type) {
      case this.protobuf.Messaging.MessageType.MsgChain: {
        const msg = this.protobuf.Messaging.MessageChain.decode(message.body);
        //          .toObject({ defaults: true });
        // Запускаем обработчик для всех сообщений в цепочке
        msg.chain.forEach(m => this.handleMessage(m));
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgInfo: {
        const msg = this.protobuf.Messaging.Messages.Info.decode(message.body);
        //          .toObject({ defaults: true });
        // Переводим нанасекунды в миллисекунды
        this.ping = msg.ping / 1000000;
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgSystemMessage: {
        const msg = this.protobuf.Messaging.Messages.SystemMessage.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleSystemMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgMovement: {
        const msg = this.protobuf.Messaging.Messages.Movement.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleMovementMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgTerrain: {
        const msg = this.protobuf.Messaging.Messages.Terrain.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleTerrainMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgChunk: {
        const msg = this.protobuf.Messaging.Response.GetChunksResponse.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleChunkMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgPingRequest:
        // Отвечаем на пинг
        logger.debug('Получен запрос на синхронизацию');
        // FIXIT: Перевести время в UTC
        this.sendPingResponse(msgTime);
        this.sendPingResponse();
        break;

      case this.protobuf.Messaging.MessageType.MsgUnitInfo: {
        const msg = this.protobuf.Messaging.Messages.UnitInfo.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleUnitInfoMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgSay: {
        const msg = this.protobuf.Messaging.Messages.Say.decode(message.body);
        //          .toObject({ defaults: true });
        this.game.handleSayMessage(msg);
        break;
      }

      default:
        logger.warn(`Неизвестное сообщение. MessageType=${message.type}`);
        break;
    }
  }

  // sendMessage отправляет сообщение на сервер
  // WebSockets не имеют нормальной обработки ошибок. Все ошибки приводят к закрытию соединения
  // и вызову обработчика onclose
  // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
  // Поэтому при отправке мы просто проверяем, что сокет открыт и если это не так, возвращаем false.
  sendMessage(type, body) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    // Упаковываем данные в сообщение-обертку
    const message = this.protobuf.Messaging.Message.create({
      type,
      body,
    });

    // Отправляем сообщение
    this.ws.send(this.protobuf.Messaging.Message.encode(message).finish());
    return true;
  }

  // Отправляет сообщение, упакованное в цепочку
  sendChain(type, body) {
    // Упаковываем данные в сообщение-обертку
    const message = this.protobuf.Messaging.Message.create({
      type,
      body,
    });

    // Создаем цепочку из единственного сообщения-обертки
    const chain = this.protobuf.Messaging.MessageChain.create({
      chain: [message],
    });

    // Отправляем цепочку
    this.sendMessage(
      this.protobuf.Messaging.MessageType.MessageChain,
      this.protobuf.Messaging.MessageChain.encode(chain).finish(),
    );
  }

  sendController(controller) {
    const msg = this.protobuf.Messaging.Messages.ApplyControllerMessage.create({
      moveForward: controller.moveForward,
      moveBackward: controller.moveBackward,
      moveLeft: controller.moveLeft,
      moveRight: controller.moveRight,
      rotateLeft: controller.rotateLeft,
      rotateRight: controller.rotateRight,
      mods: this.protobuf.Messaging.Messages.ApplyControllerMessage.Modifiers.create({
        shift: controller.modifiers.shift,
        ctrl: controller.modifiers.ctrl,
        alt: controller.modifiers.alt,
        meta: controller.modifiers.meta,
      }),
    });

    if (
      this.sendMessage(
        this.protobuf.Messaging.MessageType.MsgController,
        this.protobuf.Messaging.Messages.ApplyControllerMessage.encode(msg).finish(),
      )
    ) {
      logger.debug('Контроллер отправлен');
    }
  }

  sendChanksRequest(indecies) {
    if (indecies.length > 0) {
      const msg = this.protobuf.Messaging.Request.GetChunksRequest.create({
        chunks: indecies,
      });

      this.sendMessage(
        this.protobuf.Messaging.MessageType.MsgChunkRequest,
        this.protobuf.Messaging.Request.GetChunksRequest.encode(msg).finish(),
      );
    }
  }

  sendPingResponse(t = time.now()) {
    const timestamp = time.timestamp(t);
    const msg = this.protobuf.Messaging.Response.PingResponse.create({
      time: this.protobuf.Data.Timestamp.create({
        seconds: timestamp.seconds,
        nanos: timestamp.nanos,
      }),
    });

    this.sendMessage(
      this.protobuf.Messaging.MessageType.MsgPingResponse,
      this.protobuf.Messaging.Response.PingResponse.encode(msg).finish(),
    );
    // logger.debug('Отправлен ответ на синхронизацию');
  }

  sendUnitInfoRequest(id) {
    const message = this.protobuf.Messaging.Request.UnitInfoRequest.create({
      id,
    });

    this.sendMessage(
      this.protobuf.Messaging.MessageType.MsgUnitInfoRequest,
      this.protobuf.Messaging.Request.UnitInfoRequest.encode(message).finish(),
    );
  }

  sendSay(text) {
    const message = this.protobuf.Messaging.Messages.Say.create({
      text,
    });

    this.sendMessage(
      this.protobuf.Messaging.MessageType.MsgSay,
      this.protobuf.Messaging.Messages.Say.encode(message).finish(),
    );
  }
}

export default Connect;
