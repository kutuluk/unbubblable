import WebFont from 'webfontloader';
import version from './version';
import log from './log';
import manager from './manager';
import Game from './game';

console.log(`Unbubblable ${version.version} (${version.build}) ${version.date}`);

const start = function start() {
  const game = new Game();
  console.log(game);
  game.animate();
};

const fail = function fail() {
  // Браузер не соответствует требованиям
  const container = document.getElementById('container');
  // FIX: log.domElement может измениться
  container.appendChild(log.box);
};

if (!manager.require()) {
  fail();
  throw new Error('Браузер не соответствует требованиям');
}

manager.onready = start;
manager.onfail = fail;
// FIX: Странная конструкция
window.onload = manager.windowload.bind(manager);

WebFont.load({
  custom: {
    families: ['Hobo'],
  },
  classes: false,
  active() {
    manager.fontload(true);
  },
  inactive() {
    manager.fontload(false);
  },
});
