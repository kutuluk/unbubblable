class Log {

    constructor() {
        this.domElement = document.createElement( "div" );

        //this.dom.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.domElement.style.margin = "0";
        this.domElement.style.textAlign = "left";
        this.domElement.style.padding = "0.5em 0.5em 0.5em 0.5em";
        this.domElement.style.position = "absolute";
        this.domElement.style.left = "1em";
        this.domElement.style.width = "30em";
        this.domElement.style.height = "10em";
        this.domElement.style.bottom = "1em";
        this.domElement.style.overflow = "auto";
        //this.dom.style.font = "normal 16px Fixedsys";
        this.domElement.style.font = "normal 16px sans-serif";
        //this.dom.style.textShadow = "1px 1px 2px black, 0 0 1em red";
        //this.dom.style.textShadow = "1px 1px 0px #000000, -1px -1px 0px #000000";
        //this.dom.style.textShadow = "0px 1px 0px #000000, 0px 2px 0px #333333";
        this.domElement.style.textShadow = "0px 1px 0px #000000";
    }

    appendLog( item ) {
        let doScroll = this.domElement.scrollTop === this.domElement.scrollHeight - this.domElement.clientHeight;
        this.domElement.appendChild( item );
        if ( doScroll ) {
            this.domElement.scrollTop = this.domElement.scrollHeight - this.domElement.clientHeight;
        }
    }

    appendText( text ) {
        let item = document.createElement( "div" );
        item.innerHTML = text;
        this.appendLog( item );
    }

}

let log = new Log();

export { log };
