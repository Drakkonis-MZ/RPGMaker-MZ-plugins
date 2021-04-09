/*:
@target MZ
@author Drakkonis
@plugindesc Turns the help window for skills and items into a auto-scrolling window for long descriptions.

@param orient
@type select
@option Vertical
@option Horizontal
@text Scrolling Orientation
@desc Sets the axis the text will scroll in.
@default Vertical

@param style
@type select
@option Reversing
@option Reset
@text Scrolling Style
@desc Decides the scrolling behavior when the end of the description is reached. It will either reverse direction or reset to the top.
@default Reversing

@param speed
@text Scroll Speed
@desc Determines how fast the text scrolls.
@default .5

@param wait
@type number
@text Scroll Wait Time
@desc Time in ticks/frames to wait before scrolling begins or resets. 60 = 1 second.
@default 60

@help
By default, MZ only allows two lines for an item or skill description. For
some, that's not long enough. Sure, you COULD put in longer lines, but then
those lines get cut off! This plugin aims to change that and let you have
the descriptions you've always wanted!

This plugin turns the small, two-line help window used for item and skill
descriptions into an auto-scrolling window that should be able to handle
almost any size description. Word-wrapping is also enabled by default, so
if you want your items to have long descriptions entered via the database
editor, just keep typing away, the help window will automatically sort that
out. For manual breaks, just add the line break escape character "\n", so
your descriptions start new lines exactly where you want them.

That's pretty much it! Set the parameters to your liking and you're good to
go!

Special Note: This applies only to horizontal scrolling mode. Due to the way
text drawing is handled, it's possible that text will simply stop being
drawn after a certain point. Trying to find a dynamic way to adjust that
point doesn't seem to be very possible without rewriting the entire flow of
the function, which would very likely break a LOT of things. So if you need
more text shown on a line than what is being drawn, change the value in the
function at the very bottom of the script to a bigger number. You'll have
to experiment for yourself how big a number you'll need.

Version History:
v2.0 - Added horizontal scrolling mode.
v1.0 - Initial release.
*/

var Imported = Imported || {};
Imported.HelpScroll = true;
var Drak = Drak || {};
Drak.HelpScroll = Drak.HelpScroll || {};
Drak.HelpScroll.version = 2.00;

Drak.HelpScroll.params = PluginManager.parameters("Drak_HelpScroll");

Window_Help.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._text = "";
    Drak.HelpScroll.params["orient"] == "Vertical" ? this._scrollDir = "down" : this._scrollDir = "right";
    this._wait = 0;
    this._lines = 0;
    this._textHeight = 0;
    this._textWidth = 0;
    this._reservedRect = rect;
};

Window_Help.prototype.setText = function(text) {
    this._text = text;
    this.startMessage();
};

Window_Help.prototype.refresh = function() {
    const rect = this.baseTextRect();
    this.createContents();
    Drak.HelpScroll.params["orient"] == "Vertical" ? this.origin.y = 0: this.origin.x = 0;
    this._lines = 0;
    this._textWidth = 0;
    this.drawTextEx(this._text, rect.x, rect.y, rect.width);
};

Window_Help.prototype.processCharacter = function(textState) {
    const c = textState.text[textState.index++];
    if (c.charCodeAt(0) < 0x20) {
        this.flushTextState(textState);
        this.processControlCharacter(textState, c);
    } else {
        textState.buffer += c;
        if (Drak.HelpScroll.params["orient"] == "Vertical" && this.checkWrap(textState)) {
            this.flushTextState(textState);
            this.processNewLine(textState);
            textState.text = textState.text.slice(0, textState.index) + textState.text.slice(textState.index + 1);
        }
    }
};

Window_Help.prototype.checkWrap = function(textState) {
    var nextSpace = textState.text.indexOf(' ', textState.index + 1);
    if (nextSpace < 0) nextSpace = textState.text.length + 1;
    var word = textState.text.substring(textState.index, nextSpace);
    var size = this.textWidth(textState.buffer + word);
    return (size + textState.x > textState.width);
}

Window_Help.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    if (this._text && this._lines > 2 && Drak.HelpScroll.params["orient"] == "Vertical") this.updateMessage();
    if (this._text && Drak.HelpScroll.params["orient"] == "Horizontal") this.updateMessage();
};

Window_Help.prototype.startMessage = function() {
    this.updatePlacement();
    this.refresh();
};

Window_Help.prototype.updateMessage = function() {
    if (this._wait > 0) {
        this._wait--
    } else {
        switch(this._scrollDir) {
            case "down":
                if (this.origin.y == 0) this._wait = parseInt(Drak.HelpScroll.params["wait"]);
                this.origin.y += this.scrollSpeed();
                if (this.origin.y >= this._textHeight) {
                    this._wait = parseInt(Drak.HelpScroll.params["wait"]);
                    Drak.HelpScroll.params["style"] == "Reversing" ? this._scrollDir = "up" : this._scrollDir = "top";
                };
                break;
            case "up":
                this.origin.y -= this.scrollSpeed();
                if (this.origin.y <= 0) this._scrollDir = "down";
                break;
            case "top":
                this.origin.y = 0;
                this._scrollDir = "down";
                break;
            case "right":
                if (this.origin.x == 0) this._wait = parseInt(Drak.HelpScroll.params["wait"]);
                this.origin.x += this.scrollSpeed();
                if (this.origin.x >= this._textWidth - this.innerWidth + this.itemPadding()) {
                    this._wait = parseInt(Drak.HelpScroll.params["wait"]);
                    Drak.HelpScroll.params["style"] == "Reversing" ? this._scrollDir = "left" : this._scrollDir = "start";
                } 
                break;
            case "left":
                this.origin.x -= this.scrollSpeed();
                if (this.origin.x <= 0) this._scrollDir = "right";
                break;
            case "start":
                this.origin.x = 0;
                this._scrollDir = "right"
                break;
        }
    }
};

Window_Help.prototype.scrollSpeed = function() {
    return Number(Drak.HelpScroll.params["speed"]);
};

Window_Help.prototype.flushTextState = function(textState) {
    Window_Base.prototype.flushTextState.call(this, textState);
    this._lines += 1;
    this._textHeight = (this._lines - 2) * this.calcTextHeight(textState);
    this._textWidth = Math.max(this._textWidth, this.textWidth(this._text));
    console.log(this._textWidth)
    console.log(this.contents.width)
}

Window_Help.prototype.updatePlacement = function() {
    const rect = this._reservedRect;
    this.move(rect.x, rect.y, rect.width, rect.height);
};

Window_Help.prototype.contentsHeight = function() {
    return Math.max(this._textHeight, 1000);
};

Window_Help.prototype.contentsWidth = function() {
    return 10000;
}