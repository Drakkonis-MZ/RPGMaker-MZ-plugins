/*:
@author Drakkonis
@plugindesc This plugin aims to make most MZ plugins compatible with MV.
@version 0.05

@param gaugeOverride
@text MZ Status Gauge Override
@desc Decides if MZ gauge drawing functions take priority. Only affects gauges affected by MZ plugins.
@type boolean
@on On
@off Off
@default true

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
the command name you'll type in, ommitting any spaces. If the command has
arguments, they are listed below the command with "@arg". You MIGHT need
to look at the entire arg parameter or even the function the command calls
to make sure you know what the arg should be(for example, if they are
pre-set options, and especially if the text of the option differs from
its actual value). Also take note of the order the args are listed in.
Then type the values you want for those arguments in the same order the
args are listed in. The order is IMPORTANT, since MZ handles plugin args
with its own UI that MV doesn't have, forcing RETRO to handle the args a
certain way.

You'll also need the plugin's name, so that the function knows which
plugin to use, since some plugins may have the same command names. This
is done using "plugin name"/"command name", with args listed after as
normal. The plugin name and command name MUST be without spaces, separated
by a forward slash.

Basic scene construction is now functional.

Sprite_Gauge functions are implemented, but the object is different. In
MZ, the gauges are their own independent sprites, where in MV, the gauges
are drawn directly on the window. RETRO instead stores the gauge sprite
information in an object for each gauge and attaches that information to
each battler, then uses the native gauge drawing methods using that
information. Since MV and MZ use completely separate processes for gauges
and plugin order isn't currently detected by RETRO, it doesn't know if
an MZ plugin that has sprite gauge functions is after, and thus "overwriting",
an MV plugin that modifies the gauge drawing, so I've added a parameter
to handle that. If Gauge Overwrite is turned on, RETRO checks to see if
there is any custom sprite gauge data defined for the gauge in question.
If there is, it uses that information to draw the gauge. Otherwise the
native function is used.

Currently known incompatible features:

I've been told that web/mobile versions of games may not be able to use
MZ plugin commands due to the way RETRO gets the information it needs.
I haven't tested it myself, and don't really have the means to do so on
my own. Either way this will be addressed before the v1.0 release.

PIXI - I know that MV and MZ use different versions of PIXI, so anything
using the newer PIXI will likely remain incompatible. TBH, I don't fully
understand what PIXI is, so anything involving PIXI will likely either
be outsourced or be one of the last things implemented.

To Do: These aren't on the immediate agenda, but will be worked on later.
    Detect proper plugin "overwrite" order for related functions that
        are handled VERY differently between engines(like stat gauges).

Version History:
v0.05 - Overhauled MZ plugin command functions.
        Implemented MZ sprite hue changes.
        Fixed an issue with stat gauges that would cause a crash after
        loading a save file. (5/5/21)
v0.04 - Fixed a small bug with the updated plugin command code.
        Added ImageManager.icon size data.
        EquipSlot.drawItem now passes width to drawItemName.
        Added MZ's textState functions.
        Fixed help window positioning without breaking the native one.
        Implemented a function to see if an MZ plugin is calling a shared
        function. Sometimes they pass different arguments. (4/26/21)
v0.03 - Sprite_Gauge functions implemented, with a param to control
        overwriting of the native gauge drawing.
        Fixed an issue in the plugin command code that was preventing
        the plugin manager from displaying RETRO's information. (4/23/21)
v0.02 - ColorManager more fully implemented, some scene construction
        enabled. (4/22/21)
v0.01 - initial unstable release (4/21/21)
*/

const Retro = PluginManager.parameters('RETRO');
Retro.gaugeOverride = Retro.gaugeOverride == "true";
Retro.MZPlugins = {}; //MZ plugin command information

PluginManager.MZ_commands = {}; //Plugin command information from MZ's registerCommand.

//aliased functions for general compatibility
MV_SceneBoot_title = Scene_Boot.prototype.updateDocumentTitle;
MV_PluginCommand = Game_Interpreter.prototype.pluginCommand;
MV_MenuBase_help = Scene_MenuBase.prototype.createHelpWindow;
MV_WindowBase_init = Window_Base.prototype.initialize;
MV_WindowBase_contents = Window_Base.prototype.createContents;
MV_WindowHelp_init = Window_Help.prototype.initialize;
MV_ActorGaugeHP = Window_Base.prototype.drawActorHp;
MV_ActorGaugeMP = Window_Base.prototype.drawActorMp;
MV_ActorGaugeTP = Window_Base.prototype.drawActorTp;
MV_BattlerBase_init = Game_BattlerBase.prototype.initialize;
MV_EquipDrawItem = Window_EquipSlot.prototype.drawItem;
MV_ProcNormChar = Window_Base.prototype.processNormalCharacter;
MV_ImageManager_loadNormBit = ImageManager.loadNormalBitmap;
MV_SceneBoot_start = Scene_Boot.prototype.start;

//aliased functions for specific plugin compatibility
MV_WindowBase_textColor = Window_Base.prototype.textColor;

//completely custom functions

Retro.getPluginData = function(plugin) {
    const params = this.parsePlugin(plugin); var data = {}, MZ = false, cmd = "", arg = "";
    while (params.length > 0) {
        if (params[0].includes("@target" && "MZ")) MZ = true, params.shift();
        else if (params[0].includes("@command")) {range = this.getRange(params);
            while (range > 0) {
                switch (params[0].slice(0, 4)) {
                    case "@com": cmd = params[0].slice(9).replace(/\s+/g, ""); data[cmd] = {};
                        data[cmd].func = PluginManager.MZ_commands[plugin][cmd];
                        data[cmd].args = []; data[cmd].defs = {}; break;
                    case "@arg": arg = params[0].slice(5); data[cmd].args.push(arg); break;
                    case "@def": data[cmd].defs[arg] = params[0].slice(9); break;
                }; range--; params.shift();
            };
        } else params.shift();
    }; if (MZ) Retro.MZPlugins[plugin] = data, MZ = false;
};

Retro.parsePlugin = function(pluginName) {
    var params = [];
    const fs = require('fs');
    const contents = fs.readFileSync('./js/plugins/' + pluginName + '.js').toString();
    const lines = contents.split('\n');
    lines.forEach(l => {
        l = l.trim();
        if (l.includes("@")) {
            if (l.charAt(0) == "*") {l = l.slice(1); l = l.trim()};
            if (l.charAt(0) == "@") params.push(l);
        } else if (l.includes("/")) {
            if (l.indexOf("/") !== 0 && l.charAt(l.indexOf("/") - 1) == "*") delete lines; return params; //end of non-structure section
        }
    }); return params;
};

Retro.getRange = function(params) {
    var range = 1; 
    for (i = 1; i < params.length; i++) {
        if (params[i].includes("@help") || params[i].includes("@param") || params[i].includes("@command")) return range
        else range++
    }; return range;
};

Retro.findCaller = function() { //figures out exactly WHAT has called the function that this function was called from
    const err = new Error(); var file = "";
    stack = err.stack.split("at "); stack.shift();
    for (i = 0; i < stack.length; i++) {
        file = stack[i].slice(stack[i].indexOf("/js/") + 4, stack[i].indexOf(".js"))
        file.substring(0,7) == "plugins" ? file = file.slice(8) : file = "MV"; //determines if MV or a plugin was the caller
        if (file !== "RETRO") return file; //we're not looking for RETRO as a caller
    };
};

Retro.isForMZ = function(pluginName) {return Retro.MZPlugins.hasOwnProperty(pluginName)};

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
    tpGaugeColor2() {if (!this._skin) this.setWindowSkin(); return this._skin.tpGaugeColor2()},
    tpCostColor() {if (!this._skin) this.setWindowSkin(); return this._skin.tpCostColor()},
    pendingColor() {if (!this._skin) this.setWindowSkin(); return this._skin.pendingColor()},
};

//MZ plugin command processing

Scene_Boot.prototype.updateDocumentTitle = function() {//best place I could find for this, thanks to CGMZ_Core.
    MV_SceneBoot_title.call(this); PluginManager._scripts.forEach(p =>{Retro.getPluginData(p);})
};

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    var MZ_Cmd = false
    if (command.includes("/")) MZ_Cmd = true;
    if (MZ_Cmd) PluginManager.MZ_PluginCommand(command, args);
    else MV_PluginCommand.call(this, command, args);
};

PluginManager.MZ_PluginCommand = function(command, args) {
    command = command.split("/"); command = Retro.MZPlugins[command[0]][command[1]];
    if (command.args.length > 0) {arg = {};
        for (i = 0; i < command.args.length; i++) args[i] ? arg[command.args[i]] = args[i] : arg[command.args[i]] = command.defs[command.args[i]];
    }; command.func.call(this, arg);
};

PluginManager.registerCommand = function(pluginName, commandName, func) {
    this.MZ_commands[pluginName] = this.MZ_commands[pluginName] || {};
    this.MZ_commands[pluginName][commandName.replace(/\s+/g, '')] = func;
};

//window construction

Game_System.prototype.windowPadding = function() {return Window_Base.prototype.standardPadding()};
Window.prototype.addInnerChild = function(child) {this.addChildToBack(child)};

Object.defineProperty(Window.prototype, "innerRect", {
    get: function() {
        return new Rectangle(
            this.padding,
            this.padding,
            this.contentsWidth(),
            this.contentsHeight()
        );
    },
    configurable: true
});

Window_Base.prototype.initialize = function(...args) {
    var x, y, width, height;
    if (typeof args[0] == 'object') { //this is an MZ window init call
        x = args[0].x; y = args[0].y; width = args[0].width; height = args[0].height;
    } else { //this is an MV window init call
        x = args[0]; y = args[1]; width = args[2]; height = args[3];
    };
    MV_WindowBase_init.call(this, x, y, width, height);
};

Window_Base.prototype.createContents = function() {MV_WindowBase_contents.call(this); this.contentsBack = this.contents};

Window_Help.prototype.initialize = function(numLines) {
    if (typeof(numLines) == "object") {//if object, an MZ scene is creating this window and may need it moved from default
        Window_Base.prototype.initialize.call(this, numLines); this._text = '';
    } else MV_WindowHelp_init.call(this, numLines);
};

Window_Selectable.prototype.itemRectWithPadding = function(index) {return this.itemRectForText(index)};
Window_Selectable.prototype.itemAt = function(index) {return this._data[index]};
Window_Selectable.prototype.itemLineRect = function(index) {
    rect = this.itemRect(index); rect.width -= this.textPadding(); return rect;
};

Window_ItemCategory.prototype.initialize = function(rect) {
    if (rect) Window_HorzCommand.prototype.initialize.call(this, rect.x, rect.y);
    else Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_ItemCategory.prototype.needsSelection = function() {return this.maxItems() >= 2};

Window_EquipSlot.prototype.drawItem = function(index) {//MV doesn't pass a width to drawItemName, MZ does.
    MV_EquipDrawItem.call(this, index);
    if (this._actor) {var rect = this.itemRectForText(index);
        this.drawItemName(this._actor.equips()[index], rect.x + 138, rect.y, rect.width);
    };
};

function Window_Scrollable() {this.initialize(...arguments)};

Window_Scrollable.prototype = Object.create(Window_Selectable.prototype); Window_Scrollable.prototype.constructor = Window_Scrollable;

//scene construction

Scene_Base.prototype.calcWindowHeight = function(numLines, selectable) {
    if (selectable) return Window_Selectable.prototype.fittingHeight(numLines);
    else return Window_Base.prototype.fittingHeight(numLines);
};

Scene_Base.prototype.isBottomHelpMode = function() {return true};
Scene_MenuBase.prototype.helpAreaTop = function() {return this.isBottomHelpMode() ? this.mainAreaBottom() : 0};
Scene_MenuBase.prototype.helpAreaBottom = function() {return this.helpAreaTop() + this.helpAreaHeight()};
Scene_MenuBase.prototype.helpAreaHeight = function() {return this.calcWindowHeight(2, false)};
Scene_MenuBase.prototype.mainAreaTop = function() {return !this.isBottomHelpMode() ? this.helpAreaBottom() : 0};
Scene_MenuBase.prototype.mainAreaBottom = function() {return this.mainAreaTop() + this.mainAreaHeight()};
Scene_MenuBase.prototype.mainAreaHeight = function() {return Graphics.boxHeight - this.helpAreaHeight()};

Scene_MenuBase.prototype.helpWindowRect = function() {
    const wx = 0; const wy = this.helpAreaTop();
    const ww = Graphics.boxWidth; const wh = this.helpAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
};

Scene_MenuBase.prototype.createHelpWindow = function() {
    const caller = Retro.findCaller();
    if (caller !== "MV" && Retro.isForMZ(caller)) {
        this._helpWindow = new Window_Help(this.helpWindowRect());
        this.addWindow(this._helpWindow);
    } else MV_MenuBase_help.call(this);
};

//gauge construction
function Sprite_Gauge() {this.initialize(...arguments)};

Sprite_Gauge.prototype = Object.create(Sprite.prototype); Sprite_Gauge.prototype.constructor = Sprite_Gauge;

//in MZ Sprite_Gauge is an actual sprite, here it merely stores the gauge's data
Sprite_Gauge.prototype.initialize = function(battler, type) {this._battler = battler; this._statusType = type};
Sprite_Gauge.prototype.label = function() {return null};
Sprite_Gauge.prototype.labelColor = function() {return null};
Sprite_Gauge.prototype.valueColor = function() {return null};
Sprite_Gauge.prototype.gaugeColor1 = function() {return null};
Sprite_Gauge.prototype.gaugeColor2 = function() {return null};
Sprite_Gauge.prototype.currentValue = function() {
    switch (this._statusType) {
        case "hp": return this._battler.hp;
        case "mp": return this._battler.mp;
        case "tp": return this._battler.tp;
    };
};
Sprite_Gauge.prototype.currentMaxValue = function() {
    switch (this._statusType) {
        case "hp": return this._battler.mhp;
        case "mp": return this._battler.mmp;
        case "tp": return this._battler.maxTp();
    };
};
Sprite_Gauge.prototype.isMod = function() { //if there are no Sprite_Gauge functions for this gauge, no overwrite will be processed
    var mod = this.label();
    if (!mod) mod = this.labelColor(); if (!mod) mod = this.valueColor();
    if (!mod) mod = this.gaugeColor1(); if (!mod) mod = this.gaugeColor2();
    return mod ? true : false;
};

Window_Base.prototype.drawActorHp = function(actor, x, y, width) {width = width || 186;
    if (Retro.gaugeOverride && actor.hp_gauge.isMod()) this.gaugeOverwrite(actor, x, y, width, "hp");
    else MV_ActorGaugeHP.call(this, actor, x, y, width);
};

Window_Base.prototype.drawActorMp = function(actor, x, y, width) {width = width || 186;
    if (Retro.gaugeOverride && actor.mp_gauge.isMod()) this.gaugeOverwrite(actor, x, y, width, "mp");
    else MV_ActorGaugeMP.call(this, actor, x, y, width);
};

Window_Base.prototype.drawActorTp = function(actor, x, y, width) {width = width || 186;
    if (Retro.gaugeOverride && actor.tp_gauge.isMod()) this.gaugeOverwrite(actor, x, y, width, "tp");
    else MV_ActorGaugeTP.call(this, actor, x, y, width);
};

Window_Base.prototype.gaugeOverwrite = function(battler, x, y, width, type) {
    var gColor1, gColor2, lColor, lText, vColor1, vColor2, val;
    switch (type) {
        case "hp":
            gColor1 = battler.hp_gauge.gaugeColor1() || this.hpGaugeColor1();
            gColor2 = battler.hp_gauge.gaugeColor2() || this.hpGaugeColor2();
            lColor = battler.hp_gauge.labelColor() || this.systemColor();
            lText = battler.hp_gauge.label() || TextManager.hpA;
            vColor1 = battler.hp_gauge.valueColor() || this.hpColor(battler);
            vColor2 = battler.hp_gauge.valueColor() || this.normalColor();
            val = battler.hpRate(); break;
        case "mp":
            gColor1 = battler.mp_gauge.gaugeColor1() || this.mpGaugeColor1();
            gColor2 = battler.mp_gauge.gaugeColor2() || this.mpGaugeColor2();
            lColor = battler.mp_gauge.labelColor() || this.systemColor();
            lText = battler.mp_gauge.label() || TextManager.mpA;
            vColor1 = battler.mp_gauge.valueColor() || this.mpColor(battler);
            vColor2 = battler.mp_gauge.valueColor() || this.normalColor();
            val = battler.mpRate(); break;
        case "tp":
            gColor1 = battler.tp_gauge.gaugeColor1() || this.tpGaugeColor1();
            gColor2 = battler.tp_gauge.gaugeColor2() || this.tpGaugeColor2();
            lColor = battler.tp_gauge.labelColor() || this.systemColor();
            lText = battler.tp_gauge.label() || TextManager.tpA;
            vColor1 = battler.tp_gauge.valueColor() || this.tpColor(battler);
            val = battler.tpRate(); break;
    };
    this.drawGauge(x, y, width, val, gColor1, gColor2);
    this.changeTextColor(lColor); this.drawText(lText, x, y, 44);
    if (type == "hp") {this.drawCurrentAndMax(battler.hp, battler.mhp, x, y, width, vColor1, vColor2)}
    else if (type == "mp") {this.drawCurrentAndMax(battler.mp, battler.mmp, x, y, width, vColor1, vColor2)}
    else if (type == "tp") {this.changeTextColor(vColor1); this.drawText(battler.tp, x + width - 64, y, 64, 'right')};
};

Game_BattlerBase.prototype.initialize = function() { //adds gauge information to battlers
    MV_BattlerBase_init.call(this);
    this.hp_gauge = new Sprite_Gauge(this, "hp"); this.mp_gauge = new Sprite_Gauge(this, "mp");
    this.tp_gauge = new Sprite_Gauge(this, "tp"); this.time_gauge = new Sprite_Gauge(this, "ct");
};

//various graphics-related stuff

ImageManager.iconWidth = Window_Base._iconWidth; //MZ stores icon size in ImageManager, not the base window.
ImageManager.iconHeight = Window_Base._iconHeight;
Sprite.prototype.hide = function() {this.visible = false}; Sprite.prototype.show = function() {this.visible = true};
Sprite.prototype.setHue = function(hue) {this.bitmap = ImageManager.loadNormalBitmap(this.bitmap.path, hue)};

ImageManager.loadNormalBitmap = function(path, hue) {
    var bitmap = MV_ImageManager_loadNormBit.call(this, path, hue)
    if (!hue) bitmap.path = path;
    return bitmap;
};

//MZ's textState handling. Will eventually try to trim down if possible. Was copied wholesale from MZ functions.

Window_Base.prototype.createTextState = function(text, x, y, width) {
    const rtl = Utils.containsArabic(text); const textState = {};
    textState.text = this.convertEscapeCharacters(text); textState.index = 0;
    textState.x = rtl ? x + width : x; textState.y = y;
    textState.width = width; textState.height = this.calcTextHeight(textState);
    textState.startX = textState.x; textState.startY = textState.y;
    textState.rtl = rtl; textState.buffer = this.createTextBuffer(rtl);
    textState.drawing = true; textState.outputWidth = 0; textState.outputHeight = 0;
    return textState;
};

Utils.containsArabic = function(str) {const regExp = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/; return regExp.test(str)};
Window_Base.prototype.createTextBuffer = function(rtl) {return rtl ? "\u202B" : ""};

Window_Base.prototype.textSizeEx = function(text) {
    this.resetFontSettings();
    const textState = this.createTextState(text, 0, 0, 0); textState.drawing = false;
    this.processAllText(textState);
    return { width: textState.outputWidth, height: textState.outputHeight };
};

Window_Base.prototype.flushTextState = function(textState) {
    const text = textState.buffer; const rtl = textState.rtl;
    const width = this.textWidth(text); const height = textState.height;
    const x = rtl ? textState.x - width : textState.x; const y = textState.y;
    if (textState.drawing) {this.contents.drawText(text, x, y, width, height)};
    textState.x += rtl ? -width : width; textState.buffer = this.createTextBuffer(rtl);
    const outputWidth = Math.abs(textState.x - textState.startX);
    if (textState.outputWidth < outputWidth) {textState.outputWidth = outputWidth};
    textState.outputHeight = y - textState.startY + height;
};

Window_Base.prototype.processControlCharacter = function(textState, c) {
    if (c === "\n") {this.processNewLine(textState)};
    if (c === "\x1b") {const code = this.obtainEscapeCode(textState); this.processEscapeCharacter(code, textState)};
};

Window_Base.prototype.processNormalCharacter = function(textState) {
    if (textState.hasOwnProperty("drawing") && textState.drawing == false) {//MZ sometimes processes textState data without drawing it.
        var c = textState.text[textState.index++]; textState.x += this.textWidth(c);
    } else MV_ProcNormChar.call(this, textState);
};

Scene_Boot.prototype.start = function() {
    if (!DataManager.isBattleTest() && !DataManager.isEventTest()) {
        Scene_Base.prototype.start.call(this);
        SoundManager.preloadImportantSounds();
        this.startNormalGame();
        this.updateDocumentTitle();
    } else MV_SceneBoot_start.call(this);
}

Scene_Boot.prototype.startNormalGame = function() {
    this.checkPlayerLocation();
    DataManager.setupNewGame();
    SceneManager.goto(Scene_Title);
    Window_TitleCommand.initCommandPosition();
};

//Compatibility functions
//note: the functions here are only if they need to be modified to allow a certain plugin to work, and not needed otherwise.
//If a function is already modified for RETRO functionality in general, any specific compatibility requirements will be there instead.

Window_Base.prototype.textColor = function(n) {
    if (n > 31 && Imported.CGMZ_InfiniteColors) return ColorManager.textColor(n);
    return MV_WindowBase_textColor.call(this, n);
};