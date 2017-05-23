// import SimpleBar from 'simplebar';
import Optiscroll from 'optiscroll';

// https://github.com/felixexter/scrollbarWidth/blob/master/scrollbarWidth.js
/*
function scrollbarWidth () {
  let body = document.body
  let box = document.createElement('div')
  let boxStyle = box.style
  let width

  boxStyle.position = 'absolute'
  boxStyle.top = boxStyle.left = '-9999px'
  boxStyle.width = boxStyle.height = '100px'
  boxStyle.overflow = 'scroll'

  body.appendChild(box)

  width = box.offsetWidth - box.clientWidth

  body.removeChild(box)

  return width
}
*/

class Log {
  constructor() {
    this.game = undefined;

    this.boxHeight = 200;

    const padding = 10;
    const boxWidth = 450;

    const inputFieldHeight = 20;
    const inputPadding = 2;
    const inputPaddingLeft = 8;
    const inputPaddingTop = 4;
    const inputHeight = inputFieldHeight + inputPadding + inputPaddingTop + padding;

    this.boxShortHeight = this.boxHeight - inputHeight;
    this.boxBottom = padding;
    this.boxBottomShort = padding + inputHeight;

    const chatWidth = boxWidth - padding * 2;
    const chatFullHeight = this.boxHeight - padding * 2;
    const chatShortenedHeight = chatFullHeight - inputHeight;

    const inputWidth = chatWidth - inputPadding - inputPaddingLeft;

    this.box = document.createElement('div');
    this.box.className = 'chatBox';
    const boxStyle = this.box.style;
    boxStyle.width = `${boxWidth}px`;
    boxStyle.height = `${this.boxShortHeight}px`;
    //        boxStyle.bottom = `${this.boxBottomShort}px`;
    this.resize();

    this.box.onmouseover = () => {
      this.box.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    };
    this.box.onmouseout = () => {
      this.box.style.backgroundColor = '';
    };

    const content = document.createElement('div');
    content.style.width = `${chatWidth}px`;
    content.style.height = `${chatShortenedHeight}px`;
    content.classList.add('chatContent');
    content.classList.add('optiscroll');

    this.optiscroll = new Optiscroll(content, { minTrackSize: 20 });
    this.chat = this.optiscroll.scrollEl;

    this.filler = document.createElement('div');
    this.filler.style.height = this.chat.style.height;
    this.chat.appendChild(this.filler);

    this.input = document.createElement('input');
    this.input.setAttribute('type', 'text');

    const inputStyle = this.input.style;
    inputStyle.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    inputStyle.font = 'normal 14px Hobo';
    inputStyle.color = '#ffe254';

    inputStyle.position = 'absolute';
    inputStyle.visibility = 'hidden';
    inputStyle.left = `${padding}px`;
    inputStyle.bottom = `${padding}px`;
    inputStyle.height = `${inputFieldHeight}px`;
    inputStyle.width = `${inputWidth}px`;

    inputStyle.padding = `${inputPadding}px`;
    inputStyle.paddingLeft = `${inputPaddingLeft}px`;
    inputStyle.paddingTop = `${inputPaddingTop}px`;
    inputStyle.boxShadow = '0 0 1px #999';
    inputStyle.border = '0px';
    inputStyle.overflow = 'hidden';
    this.input.onkeydown = (event) => {
      this.say(event);
    };

    this.box.appendChild(this.input);
    this.box.appendChild(content);
  }

  init(game) {
    this.game = game;
  }

  resize() {
    this.box.style.top = `${window.innerHeight - this.boxHeight - 10}px`;
  }

  focus() {
    //        this.box.style.bottom = `${this.boxBottom}px`;
    this.box.style.height = `${this.boxHeight}px`;
    this.input.style.visibility = 'visible';
    this.input.focus();
  }

  say(event) {
    switch (event.keyCode) {
      case 13:
        if (this.input.value !== '') {
          this.game.connect.sendSay(this.input.value);
          this.optiscroll.scrollTo(false, 'bottom', 0);
        }
        this.input.value = '';

        this.input.style.visibility = 'hidden';
        this.box.style.height = `${this.boxShortHeight}px`;
        //            this.box.style.bottom = `${this.boxBottomShort}px`;
        event.stopPropagation();
        document.body.focus();
        break;

      case 27:
        this.input.style.visibility = 'hidden';
        this.box.style.height = `${this.boxShortHeight}px`;
        //            this.box.style.bottom = `${this.boxBottomShort}px`;
        event.stopPropagation();
        document.body.focus();
        break;
    }
  }

  appendLog(item) {
    const clientTop = this.chat.scrollHeight - this.chat.clientHeight - 1;
    const doScroll = this.chat.scrollTop > clientTop;
    this.chat.appendChild(item);

    if (this.filler.clientHeight > 0) {
      const h = this.filler.clientHeight - item.clientHeight;
      if (h <= 0) {
        this.filler.style.visibility = 'hidden';
      }
      this.filler.style.height = `${h}px`;
    }

    if (doScroll) {
      // this.chat.scrollTop = this.chat.scrollHeight - this.chat.clientHeight;
      this.optiscroll.scrollTo(false, 'bottom', 300);
    }
  }

  appendText(text, level) {
    const item = document.createElement('div');

    switch (level) {
      case 'system':
        item.style.color = '#fae70e';
        break;

      case 'own':
        item.style.color = '#ffe254';
        break;

      case 'common':
        item.style.color = '#ffde99';
        break;

      default:
        item.style.color = '#ffffff';
        break;
    }

    item.innerHTML = text || '';
    this.appendLog(item);
  }

  systemMessage(text) {
    const d = new Date();
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    this.appendText(`${hour}:${minutes}:${seconds} ${text}`, 'system');
  }

  appendTimestamp(text) {
    const t = text || '';
    this.appendText(`[debug]: ${new Date().getTime()} ${t}`);
  }
}

export default new Log();
