/*:
@author Drakkonis
@plugindesc This plugin aims to make most MZ plugins compatible with MV.
@version 0.02

@help
-------------------------------------------------------------------------
This plugin is inspired by FOSSIL, as both aim to bridge the gap between
MV and MZ with regards to plugin compatibility. Where FOSSIL works to
make MV plugins compatible with MZ, RETRO intends the reverse, to make
MZ plugins compatible with MV.

Note: RETRO is a work-in-progress, and will probably not ever be able to
guarantee 100% compatibility with all MZ plugins. Instead RETRO works to
"translate" the most common plugin functions that differ between MV and
MZ. I'm not just adding everything MZ has that MV doesn't, anyone could
do that, and it still wouldn't work correctly since even shared functions
actually have behavioral differences.

Current features:

ColorManager manages various color-related functions in MZ, but it doesn't
exist in MV. The same functions exist, but are tied to the windows using
them. The main function used is ColorManager.textColor(color), and here
is routed to a specially created window using the default system window
skin. The window itself is never shown and is only used for its color
function. Most other ColorManager functions route to their MV window
counterparts.

Windows in MV are created with location and size parameters, and in MZ
are created with a special object that contains those parameters. Most
window creation functions route through the base window, so RETRO uses
that base window creation function to detect the argument style and
converts it to MV's style if needed.

Plugin commands are handled COMPLETELY differently between the engines,
and RETRO's implementation will require the dev to be able to find
certain lines in the code of the plugin they wish to use. In the comment
block at the top of a plugin, the author will list various parameters
using "@". For any plugin with commands, they will have those commands
listed with "@command". When using MV's plugin command feature, this is
the command name you'll type in. If the command has arguments, they are
listed below the command with "@arg". You MIGHT need to look at the
entire arg parameter or even the function the command calls to make sure
you know what the arg should be(for example, if they are pre-set options,
and especially if the text of the option differs from its actual value).
Also take note of the order the args are listed in. Then type the values
you want for those arguments in the same order the args are listed in.
The order is IMPORTANT, since MZ handles plugin args with its own UI that
MV doesn't have, forcing RETRO to handle the args a certain way.

Basic scene construction is now functional, but they may not look identical
to the MZ version. This is because the help window is ALWAYS drawn at the
top of the menu screens, and there is no option in the native function
to change its location without messing up how MV handles it on its own.
So for now at least, any MZ plugin custom scene that normally has the
help window on the bottom with everything else above will now have the
help window at the top, with everything else below. HOPEFULLY this won't
cause any issues with any custom scenes, and shouldn't if they use
MZ's modular positioning functions, they'll just be SLIGHTLY re-arranged.

Currently known incompatible features:

I've been told that web/mobile versions of games may not be able to use
MZ plugin commands due to the way RETRO gets the information it needs.
I haven't tested it myself, and don't really have the means to do so on
my own. Either way this will be addressed before the v1.0 release.

PIXI - I know that MV and MZ uses different versions of PIXI, so anything
using the newer PIXI will likely remain incompatible. TBH, I don't fully
understand what PIXI is, so anything involving PIXI will likely either
be outsourced or be one of the last things implemented.

Version History:
v0.02 - ColorManager more fully implemented, some scene construction
        enabled. (4/22/21)
v0.01 - initial unstable release (4/21/21)
*/

PluginManager.MZ_commands = {}; //MZ's PluginMananger commands.
PluginManager.args = {} //MZ's Plugin Command args.

//aliased functions
MV_PluginCommand = Game_Interpreter.prototype.pluginCommand;
MV_WindowBase_init = Window_Base.prototype.initialize;
MV_WindowBase_contents = Window_Base.prototype.createContents;

//ColorManager functions
const ColorManager = { //ColorManager doesn't exist at ALL in MV.
    setWindowSkin() {this._skin = new Window_Base()},
    textColor(n) {if (!this._skin) this.setWindowSkin(); return this._skin.textColor(n)},
    normalColor() {if (!this._skin) this.setWindowSkin(); return this._skin.normalColor()},
    systemColor() {if (!this._skin) this.setWindowSkin(); return this._skin.systemColor()},
    crisisColor() {if (!this._skin) this.setWindowSkin(); return this._skin.crisisColor()},
    deathColor() {if (!this._skin) this.setWindowSkin(); return this._skin.deathColor()},
    gaugeBackColor() {if (!this._skin) this.setWindowSkin(); return this._skin.gaugeBackColor()},
    hpGaugeColor1() {if (!this._skin) this.setWindowSkin(); return this._skin.hpGaugeColor1()},
    hpGaugeColor2() {if (!this._skin) this.setWindowSkin(); return this._skin.hpGaugeColor2()},
    mpGaugeColor1() {if (!this._skin) this.setWindowSkin(); return this._skin.mpGaugeColor1()},
    mpGaugeColor2() {if (!this._skin) this.setWindowSkin(); return this._skin.mpGaugeColor2()},
    mpCostColor() {if (!this._skin) this.setWindowSkin(); return this._skin.mpCostColor()},
    powerUpColor() {if (!this._skin) this.setWindowSkin(); return this._skin.powerUpColor()},
    powerDownColor() {if (!this._skin) this.setWindowSkin(); return this._skin.powerDownColor()},
    ctGaugeColor1() {if (!this._skin) this.setWindowSkin(); return this._skin.ctGaugeColor1()},
    ctGaugeColor2() {if (!this._skin) this.setWindowSkin(); return this._skin.ctGaugeColor2()},
    tpGaugeColor1() {if (!this._skin) this.setWindowSkin(); return this._skin.tpGaugeColor1()},
    tpGaugeColor2() {if (!this._skin) this.setWindowSkin(); return this._skin.tpGaugeColor()},
    tpCostColor() {if (!this._skin) this.setWindowSkin(); return this._skin.tpCostColor()},
    pendingColor() {if (!this._skin) this.setWindowSkin(); return this._skin.pendingColor()},
}

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    var MZ_Cmd = false
    for (k of Object.keys(PluginManager.MZ_commands)) if (k == command) MZ_Cmd = true;
    if (MZ_Cmd) PluginManager.MZ_PluginCommand(command, args);
    else MV_PluginCommand.call(this, command, args);
};

PluginManager.MZ_PluginCommand = function(command, args) {
    if (this.args[command]) {
        arg = {};
        for (i = 0; i < this.args[command].length; i++) arg[this.args[command][i]] = args[i];
    };
    this.MZ_commands[command].call(this, arg);
}

PluginManager.registerCommand = function(pluginName, commandName, func) {
    this.MZ_commands[commandName] = func;
    this.getCommandArgs(pluginName, commandName)
};

PluginManager.getCommandArgs = function(pluginName, commandName) {
    var params = this.parsePlugParams(pluginName);
    while (params[0] !== "@command " + commandName) {params.shift(); if (params.length == 0) break};
    if (this.hasArgs(params)) {
        this.args[commandName] = [];
        while (params.length > 0) {
            while (!params[0].includes("@arg")) {params.shift(); if (params.length == 0) break};
            if (params.length > 0) {
                this.args[commandName].push([params[0].split(" ")[1]]);
                params.shift();
            }
        }
    }
    console.log(this.args);
};

PluginManager.hasArgs = function(params) {
    for (i = 1; i < params.length; i++) {
        if (params[i].includes("@arg")) return true;
        if (params[i].includes("@command")) return false;
        if (params[i].includes("@param")) return false;
    };
};

PluginManager.parsePlugParams = function(pluginName) {
    var params = [], block = false;
    const fs = require('fs');
    const contents = fs.readFileSync('./js/plugins/' + pluginName + '.js').toString();
    const lines = contents.split('\n');
    lines.forEach(l => {
        l = l.trim();
        if (l == "/*:") block = true;
        else if (l == "*/") block = false;
        else if (block) if (l.includes("@")) {
            if (l.charAt(0) == "*") {l = l.slice(1); l = l.trim()};
            params.push(l);
        }
    }); return params;
};

//window construction

Window_Base.prototype.initialize = function(...args) {
    var x, y, width, height;
    if (typeof args[0] == 'object') { //this is an MZ window init call
        x = args[0].x;
        y = args[0].y;
        width = args[0].width;
        height = args[0].height;
    } else { //this is an MV window init call
        x = args[0];
        y = args[1];
        width = args[2];
        height = args[3];
    };
    MV_WindowBase_init.call(this, x, y, width, height);
};

Window_Base.prototype.createContents = function() {
    MV_WindowBase_contents.call(this);
    this.contentsBack = this.contents;
};

Window_ItemCategory.prototype.initialize = function(rect) {
    if (rect) Window_HorzCommand.prototype.initialize.call(this, rect.x, rect.y);
    else Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_ItemCategory.prototype.needsSelection = function() {
    return this.maxItems() >= 2;
};

function Window_Scrollable() {
    this.initialize(...arguments);
}

Window_Scrollable.prototype = Object.create(Window_Selectable.prototype);
Window_Scrollable.prototype.constructor = Window_Scrollable;

//scene construction

Scene_Base.prototype.isBottomHelpMode = function() {
    return false;
};

Scene_Base.prototype.calcWindowHeight = function(numLines, selectable) {
    if (selectable) return Window_Selectable.prototype.fittingHeight(numLines);
    else return Window_Base.prototype.fittingHeight(numLines);
};

Scene_MenuBase.prototype.helpAreaTop = function() {
    return this.isBottomHelpMode() ? this.mainAreaBottom() : 0;
};

Scene_MenuBase.prototype.helpAreaBottom = function() {
    return this.helpAreaTop() + this.helpAreaHeight();
};

Scene_MenuBase.prototype.helpAreaHeight = function() {
    return this.calcWindowHeight(2, false);
};

Scene_MenuBase.prototype.mainAreaTop = function() {
    return !this.isBottomHelpMode() ? this.helpAreaBottom() : 0;
};

Scene_MenuBase.prototype.mainAreaBottom = function() {
    return this.mainAreaTop() + this.mainAreaHeight();
};

Scene_MenuBase.prototype.mainAreaHeight = function() {
    return Graphics.boxHeight - this.helpAreaHeight();
};