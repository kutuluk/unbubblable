//import SimpleBar from 'simplebar';
import Optiscroll from 'optiscroll';

// https://github.com/felixexter/scrollbarWidth/blob/master/scrollbarWidth.js
function scrollbarWidth() {
    let
        body = document.body,
        box = document.createElement( 'div' ),
        boxStyle = box.style,
        width;

    boxStyle.position = 'absolute';
    boxStyle.top = boxStyle.left = '-9999px';
    boxStyle.width = boxStyle.height = '100px';
    boxStyle.overflow = 'scroll';

    body.appendChild( box );

    width = box.offsetWidth - box.clientWidth;

    body.removeChild( box );

    return width;
}

class Log {

    constructor() {

        let padding = 10;

        let inputFieldHeight = 20;
        let inputPadding = 2;
        let inputPaddingLeft = 8;
        let inputPaddingTop = 4;
        this.inputHeight = inputFieldHeight + inputPadding + inputPaddingTop + padding;

        let boxWidth = 450;
        this.boxHeight = 200;
        this.boxShortHeight = this.boxHeight - this.inputHeight;
        this.boxBottom = padding;
        this.boxBottomShort = padding + this.inputHeight;


        let chatWidth = boxWidth - padding * 2;
        this.chatFullHeight = this.boxHeight - padding * 2;
        this.chatShortenedHeight = this.chatFullHeight - this.inputHeight;

        let inputWidth = chatWidth - inputPadding - inputPaddingLeft;


        this.chatBox = document.createElement( "div" );
        let chatBoxStyle = this.chatBox.style;
        chatBoxStyle.position = "absolute";
        chatBoxStyle.left = `${padding}px`;
        chatBoxStyle.width = `${boxWidth}px`;
        chatBoxStyle.height = `${this.boxShortHeight}px`;
        chatBoxStyle.bottom = `${this.boxBottomShort}px`;
        chatBoxStyle.font = "normal 14px Hobo";

        this.chatBox.onmouseover = () => {
            this.chatBox.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        };
        this.chatBox.onmouseout = () => {
            this.chatBox.style.backgroundColor = "";
        };

        this.chat = document.createElement( "div" );
        //        this.chat.style.backgroundColor = "rgba(0, 0, 255, 0.5)";
        this.chat.style.position = "absolute";
        this.chat.style.top = `${padding}px`;
        this.chat.style.left = `${padding}px`;
        this.chat.style.width = `${chatWidth}px`;
        this.chat.style.height = `${this.chatShortenedHeight}px`;
        this.chat.style.textShadow = "0px 1px 0px #000000";

        this.chat.className = "optiscroll";

        this.optiscroll = new Optiscroll( this.chat, { minTrackSize: 20 } );
        this.content = this.optiscroll.scrollEl;

        this.filler = document.createElement( "div" );
        this.filler.style.height = this.chat.style.height;
        this.content.appendChild( this.filler );

        this.input = document.createElement( "input" );
        this.input.setAttribute( "type", "text" );
        this.input.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.input.style.font = "normal 14px Hobo";
        this.input.style.color = "#ffe254";

        this.input.style.position = "absolute";
        this.input.style.visibility = "hidden";
        this.input.style.left = `${padding}px`;
        this.input.style.bottom = `${padding}px`;
        this.input.style.height = `${inputFieldHeight}px`;
        this.input.style.width = `${inputWidth}px`;

        this.input.style.padding = `${inputPadding}px`;
        this.input.style.paddingLeft = `${inputPaddingLeft}px`;
        this.input.style.paddingTop = `${inputPaddingTop}px`;
        this.input.style.boxShadow = "0 0 1px #999";
        this.input.style.border = "0px";
        this.input.style.overflow = "hidden";
        this.input.onkeydown = ( event ) => { this.say( event ); };


        this.chatBox.appendChild( this.input );
        this.chatBox.appendChild( this.chat );

    }

    setGame( game ) {
        this.game = game;
    }

    focus() {
        this.inputShow();
        this.input.focus();
    }

    inputShow() {
        this.chatBox.style.bottom = `${this.boxBottom}px`;
        this.chatBox.style.height = `${this.boxHeight}px`;
        this.input.style.visibility = "visible";
    }

    say( event ) {

        switch ( event.keyCode ) {

        case 13:
            if ( this.input.value !== "" ) {
                this.game.connect.sendSay( this.input.value );
                this.optiscroll.scrollTo( false, 'bottom', 0 );
            }
            this.input.value = "";

            this.input.style.visibility = "hidden";
            this.chatBox.style.height = `${this.boxShortHeight}px`;
            this.chatBox.style.bottom = `${this.boxBottomShort}px`;
            event.stopPropagation();
            document.body.focus();
            break;

        case 27:
            this.input.style.visibility = "hidden";
            this.chatBox.style.height = `${this.boxShortHeight}px`;
            this.chatBox.style.bottom = `${this.boxBottomShort}px`;
            event.stopPropagation();
            document.body.focus();
            break;

        }
    }

    appendLog( item ) {

        let clientTop = this.content.scrollHeight - this.content.clientHeight - 1;
        let doScroll = this.content.scrollTop > clientTop;
        this.content.appendChild( item );

        if ( this.filler.clientHeight > 0 ) {
            let h = this.filler.clientHeight - item.clientHeight;
            if ( h <= 0 ) {
                this.filler.style.visibility = "hidden";
            }
            this.filler.style.height = `${h}px`;
        }

        if ( doScroll ) {
            //this.content.scrollTop = this.content.scrollHeight - this.content.clientHeight;
            this.optiscroll.scrollTo( false, 'bottom', 300 );

        }

    }

    appendText( text, level ) {

        let item = document.createElement( "div" );

        switch ( level ) {

        case "system":

            item.style.color = "#fae70e";
            break;

        case "own":

            item.style.color = "#ffe254";
            break;

        case "common":

            item.style.color = "#ffde99";
            break;

        default:

            item.style.color = "#ffffff";
            break;

        }

        item.innerHTML = ( text ) ? text : '';
        this.appendLog( item );
    }

    systemMessage( text ) {

        let d = new Date();
        let hour = d.getHours();
        let minutes = d.getMinutes();
        let seconds = d.getSeconds();

        this.appendText( `${hour}:${minutes}:${seconds} ` + text, 'system' );
    }

    appendTimestamp( text ) {
        let t = ( text ) ? text : '';
        this.appendText( `[debug]: ${new Date().getTime()} ${t}` );
    }

}

let log = new Log();

export { log };
