/*:
@target MZ
@author Drakkonis
@plugindesc Allows you to use a fully customizable color palette separate from the window skin, with infinite color options.
@orderAfter Drak_Core

@param palette
@type file
@dir img/system/
@text Palette
@desc The image file to use for the color palette.
@require 1

@param rowSize
@type number
@text Row Size
@desc How many colors are in each row?
@min 1
@default 8

@param sampleSize
@type number
@text Sample Size
@desc How big is each sample, in pixels? Samples must be squares.
@min 1
@default 12

@help
----------------------------------------------------------------------------
Normally, a color palette is included in a window skin image, and is limited
to 32 colors. This plugin removes that limitation and gives the developer
full control over their color options.

Part of how it does so is by requiring the color palette be entirely
contained in its own image file, which you can choose in the parameters.

In a normal color palette, there are 32 color samples, 12 pixels square, in
rows of 8. This keeps it nice and tidy in otherwise empty space in the skin
file. But with a separate palette file, this isn't necessary. Your samples
can be any size, as long as they are square, ie. the same number of pixels
in height as they are in width. They can even be just one pixel apiece.
Whatever size you decide on, all samples must be that size, and you'll need
to enter that size in the parameters. You may also decide how many colors 
you want per row, and enter that into the parameters. The palette image
itself can be any size you want, and however many colors you wish.

Once you have your palette imported and the parameters set up, that's all
you need! Simply use any color selection you like, and enjoy no longer
being bound to only 32 colors!

If no palette file is selected, the system will use the chosen window skin
like normal, and you will be restricted to the 32 colors in its palette.
*/
var Imported = Imported || {};
Imported.DrakColors = true;
const infParams = PluginManager.parameters("Drak_InfiniteColors");
infParams.rowSize = parseInt(infParams.rowSize);
infParams.sampleSize = parseInt(infParams.sampleSize);

const _CMloadSkin = ColorManager.loadWindowskin;
const _CMtextColor = ColorManager.textColor;

ColorManager.loadWindowskin = function() {
    if (infParams.palette){
        this._windowskin = ImageManager.loadSystem(infParams.palette);
        this.infPalette = true;
    } else {
        _CMloadSkin.call(this);
        this.infPalette = false;
    };
}

ColorManager.textColor = function(n) {
    if (this.infPalette) {
        const px = (n % infParams.rowSize) * infParams.sampleSize;
        const py = Math.floor(n / infParams.rowSize) * infParams.sampleSize;
        return this._windowskin.getPixel(px, py);
    } else {
        return _CMtextColor.call(this, n);
    }
}

if (Imported.DrakCore && infParams.palette) { //remove original 32 color limitation for Drak_Core's color function.
    ColorManager.getColor = function(color) {
        if (isNaN(color) && color.match(/^#[0-9A-F]{6}$/i)) return color;
        else return ColorManager.textColor(color);
    };
}
