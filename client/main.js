import { log } from './log';
import { game } from './game';

console.log(game);

if (game.playable) {
    game.animate();
} else {

    // Браузер не соответствует требованиям
    var container = document.getElementById('container');
    container.appendChild(log.domElement);

};
