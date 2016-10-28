function Log() {
	this.dom = document.createElement("div");

	//this.dom.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	this.dom.style.margin = "0";
	this.dom.style.textAlign = "left";
	this.dom.style.padding = "0.5em 0.5em 0.5em 0.5em";
	this.dom.style.position = "absolute";
	this.dom.style.left = "1em";
	this.dom.style.width = "30em";
	this.dom.style.height = "10em";
	this.dom.style.bottom = "1em";
	this.dom.style.overflow = "auto";
//				this.dom.style.font = "normal 16px Fixedsys";
	this.dom.style.font = "normal 16px sans-serif";
//				this.dom.style.textShadow = "1px 1px 2px black, 0 0 1em red";
//				this.dom.style.textShadow = "1px 1px 0px #000000, -1px -1px 0px #000000";
//				this.dom.style.textShadow = "0px 1px 0px #000000, 0px 2px 0px #333333";
	this.dom.style.textShadow = "0px 1px 0px #000000";

   	this.appendLog = function(item) {
        var doScroll = this.dom.scrollTop === this.dom.scrollHeight - this.dom.clientHeight;
        this.dom.appendChild(item);
        if (doScroll) {
            this.dom.scrollTop = this.dom.scrollHeight - this.dom.clientHeight;
        }
    };
				
    this.appendText = function(text) {
        var item = document.createElement("div");
        item.innerHTML = text;
        this.appendLog(item);
    };
};
