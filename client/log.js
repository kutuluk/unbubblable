class Log {

    constructor() {
        this.domElement = document.createElement( "div" );

        this.domElement.style.margin = "0";
        this.domElement.style.textAlign = "left";
        this.domElement.style.padding = "0.5em 0.5em 0.5em 0.5em";
        this.domElement.style.position = "absolute";
        this.domElement.style.left = "1em";
        this.domElement.style.width = "30em";
        this.domElement.style.height = "10em";
        this.domElement.style.bottom = "1em";
        this.domElement.style.overflow = "hidden";
        this.domElement.style.font = "normal 14px Hobo";
        this.domElement.style.textShadow = "0px 1px 0px #000000";

        this.domElement.onmouseover = () => {
            this.domElement.style.overflowY = 'auto';
            this.domElement.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        };
        this.domElement.onmouseout = () => {
            this.domElement.style.overflowY = 'hidden';
            this.domElement.style.backgroundColor = "";
        };

    }

    appendLog( item ) {
        let doScroll = this.domElement.scrollTop > this.domElement.scrollHeight - this.domElement.clientHeight - 1;
        this.domElement.appendChild( item );
        if ( doScroll ) {
            this.domElement.scrollTop = this.domElement.scrollHeight - this.domElement.clientHeight;
        }
    }

    appendText( text, level ) {

        let item = document.createElement( "div" );

        switch ( level ) {

        case "system":

            item.style.color = "#fae70e";
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
