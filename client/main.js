import WebFont from 'webfontloader'
import log from './log'
import manager from './manager'
import { Game } from './game'

const start = function () {
  let game = new Game()
  console.log(game)
  game.animate()
}

const fail = function () {
  // Браузер не соответствует требованиям
  let container = document.getElementById('container')
  // FIX: log.domElement может измениться
  container.appendChild(log.box)
}

if (!manager.require()) {
  fail()
  throw new Error('Браузер не соответствует требованиям')
}

manager.onready = start
manager.onfail = fail
// FIX: Странная конструкция
window.onload = manager.windowload.bind(manager)

WebFont.load({
  custom: {
    families: ['Hobo']
  },
  classes: false,
  active: function () {
    manager.fontload(true)
  },
  inactive: function () {
    manager.fontload(false)
  }
})
