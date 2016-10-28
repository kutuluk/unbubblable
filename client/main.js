//var myProtocol = require('./proto/protocol_pb');
//var protobuf = proto.protocol;
import { log } from './log';
import { game } from './game';


if (game.playable) {
	game.animate();
} else {

	// Браузер не соответствует требованиям
    var container = document.getElementById('container');
    container.appendChild(log.domElement);

};
