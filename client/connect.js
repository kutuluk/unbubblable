// Скомпилированное описание протокола в формате json
import protobufjs from 'protobufjs';
import protocolJSON from './protocol-json';
// Скомпилированный модуль
// import protocol from './protocol'

import { time } from './time';
import log from './log';

class Connect {
  constructor(game) {
    this.game = game;

    // Скомпилированный json
    this.protobuf = protobufjs.Root.fromJSON(protocolJSON).lookup('protocol');

    // Скомпилированный модуль
    //    this.protobuf = protocol.protocol

    this.ping = 0;

    this.ws = new WebSocket(`ws://${window.location.host}/ws`);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      log.appendText('[WS] Соединение установлено.');
    };

    this.ws.onerror = (error) => {
      log.appendText(`[WS] Ошибка: ${error.message}`);
    };

    this.ws.onclose = (event) => {
      let text = '';
      if (event.wasClean) {
        text = 'Соединение закрыто чисто.';
      } else {
        text = 'Обрыв соединения.';
      }
      // http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
      log.appendText(`[WS] ${text} Код: ${event.code}`);
    };

    this.ws.onmessage = (event) => {
      try {
        // Декодируем сообщение
        const msg = this.protobuf.Messaging.Message
          .decode(new Uint8Array(event.data))
          .toObject({ defaults: true });
        // Обрабатываем сообщение
        this.handleMessage(msg);
      } catch (err) {
        // log.appendText(`[PROTO read]: ${err}`);
        throw err;
      }
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case this.protobuf.Messaging.MessageType.MsgChain: {
        const msg = this.protobuf.Messaging.MessageChain
          .decode(message.body)
          .toObject({ defaults: true });
        // Запускаем обработчик для всех сообщений в цепочке
        msg.chain.forEach(() => this.handleMessage(message));
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgInfo: {
        const msg = this.protobuf.Messaging.Messages.Info
          .decode(message.body)
          .toObject({ defaults: true });
        // Переводим нанасекунды в миллисекунды
        this.ping = msg.ping / 1000000;
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgSystemMessage: {
        const msg = this.protobuf.Messaging.Messages.SystemMessage
          .decode(message.body)
          .toObject({ defaults: true });
        // FIXME: Выводим сообщение в чат, а не в лог
        log.systemMessage(msg.text);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgMovement: {
        const msg = this.protobuf.Messaging.Messages.Movement
          .decode(message.body)
          .toObject({ defaults: true });
        this.game.handleMovementMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgTerrain: {
        const msg = this.protobuf.Messaging.Messages.Terrain
          .decode(message.body)
          .toObject({ defaults: true });
        this.game.handleTerrainMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgChunk: {
        const msg = this.protobuf.Messaging.Response.GetChunksResponse
          .decode(message.body)
          .toObject({ defaults: true });
        this.game.handleChunkMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgPingRequest:
        // Отвечаем на пинг
        this.sendPingResponse();
        break;

      case this.protobuf.Messaging.MessageType.MsgUnitInfo: {
        const msg = this.protobuf.Messaging.Messages.UnitInfo
          .decode(message.body)
          .toObject({ defaults: true });
        this.game.handleUnitInfoMessage(msg);
        break;
      }

      case this.protobuf.Messaging.MessageType.MsgSay: {
        const msg = this.protobuf.Messaging.Messages.Say
          .decode(message.body)
          .toObject({ defaults: true });
        this.game.handleSayMessage(msg);
        break;
      }

      default:
        log.appendText(`[proto read]: неизвестное сообщение MessageType=${message.type}`);
        break;
    }
  }

  // Отправляет сообщение
  sendMessage(type, body) {
    if (this.ws.readyState === WebSocket.OPEN) {
      // Упаковываем данные в сообщение-обертку
      const message = this.protobuf.Messaging.Message.create({
        type,
        body,
      });

      // Отправляем сообщение
      this.ws.send(this.protobuf.Messaging.Message.encode(message).finish());
    }
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

    this.sendMessage(
      this.protobuf.Messaging.MessageType.MsgController,
      this.protobuf.Messaging.Messages.ApplyControllerMessage.encode(msg).finish(),
    );
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

  sendPingResponse() {
    const timestamp = time.timestamp();
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
