/*:
@author Drakkonis
@plugindesc This plugin aims to make most MZ plugins compatible with MV.
@version 0.10
@url https://forums.rpgmakerweb.com/index.php?threads/retro-mz-plugins-on-mv.135715/

@param gaugeOverride
@text MZ Status Gauge Override
@desc Decides if MZ gauge drawing functions take priority. Only affects gauges affected by MZ plugins.
@type boolean
@on On
@off Off
@default true

@param cmds
@text Plugin Command Shortcuts
@desc The plugin commands to set shortcuts for. Use "MZcmdX" in plugin command. X is the index number.
@type struct<cmd>[]

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

The intended end result is to allow MV to use MZ plugins as if they were
written for MV in the first place.

To use, make sure all MZ plugins are imported after RETRO on the plugin
list.

If you are using a plugin that alters the status gauges(hp, mp, tp),
you'll need to set the Gauge Override parameter to determine if MV's gauge
drawing will be used, or if the MZ functions will be used, as RETRO cannot
currently detect on its own which one should be used based on plugin order.

Currently enabled features:
-MZ-MV Interaction:
--MZ plugin commands used in MV's style.
--Color elements handled via ColorManager.
--Proper window construction.
--Scene construction using MenuBase modular positioning systems.
--Sprite gauge interaction for main menu and battle status window(see below).
--Bitmap hue changes.
--Misc. graphics-related handling.
-RETRO-Specific Features
--Overwrite parameter for status gauges(to be removed later).
--Shortcuts for plugin commands and their arguments.

Currently known incompatible features:
Nested array and nested object arguments in plugin commands. An array in
an object or an object in an array is fine, but not if an object has another
object in it anywhere, and same for arrays. This will be addressed in
a later update.

To Do: These aren't on the immediate agenda, but will be worked on later.
    Detect proper plugin "overwrite" order for related functions that
        are handled VERY differently between engines(like stat gauges).

MZ Plugin Commands:
In MV, plugin commands are entered as a single string, and no distinction
was really possible between plugins that might have the same command names.
MZ, the event command for plugin commands had its own separate UI, and
each plugin that had commands could be selected. Complex arguments for
those commands were also made relatively trivial via this UI.

RETRO can't recreate MZ's UI, but a tool exists that does, made by OcRam.
Get it here:
https://forums.rpgmakerweb.com/index.php?threads/retro-plugin-command-ui.137124/
This tool allows you to set up a command as you would in MZ, and will
provide a line of text that you can copy into MV's plugin command input.

You can always enter the command information manually, but due to the
way RETRO is forced to handle MZ commands, it's a fairly complex process
even for a simple command. OcRam's UI is HIGHLY recommended to ensure
that a command is entered successfully.

If you wish to enter a command manually, I've written documentation
detailing the process, as well as other details on RETRO's features and
inner workings. Find it here:
https://raw.githubusercontent.com/Drakkonis-MZ/RPGMaker-MZ-plugins/main/RETRO%20Documentation.txt

For complex or frequently used commands and arguments, RETRO has shortcut
functionality for MZ plugin commands, set up in the plugin manager. When
you set up a shortcut, you'll enter the plugin and command name as you
would when using the Plugin Command event command, but without arguments.
Then, when using the event command, you can type MZcmdX for the command
name, where X is the number next to the shortcut you set up. If you wish,
you may even set up argument shortcuts for those commands. Argument
shortcuts can ONLY be set up for a command shortcut, and can only be used
with that shortcut. To create an argument shortcut, navigate to the command
shortcut you want, add a new argument shortcut and set the text to be
whatever you would type in as the arguments for the command. To use the
shortcut, type in MZargX, where X is the number next to the shortcut you
set up. Remember, each argument shortcut is tied to a command shortcut, and
cannot be used independently. Example use: "MZcmd3 MZarg2" in the event
command would correspond to the second argument shortcut set up for the
third command shortcut in the list.

Version History:
v0.10 - 6/4/21
Added clickable sprite object.
Added functionality for TouchInput movement when not being pressed.
Added formatting for struct arguments in plugin commands.
Added array replaceAll as an extension of the string version.
Console warnings provided for plugins that have an order defined
    using functionality introduced in MZ.
Added a shortcut feature for MZ plugin commands.
Added support for various MZ plugin command argument types,
        including objects, arrays, and multi-word strings.
Contributions from OcRam:
    Bug fix for MZ plugin commands that don't have arguments.
    Added matchAll string regex function for environments that don't
        have it(polyfill).
    Added replaceAll string function polyfill.
    Added remove array function polyfill.
    Added ability for MZ plugins to call user-defined plugin commands
        from other plugins through MZ plugin command functions.
    Various property definitions that are named SLIGHTLY differently
        in MZ. (".*" vs "._*", where * is the same name otherwise)
    A few miscellaneous window-related functions.
    MZ tile drawing functions added.

For more of RETRO's update history, please see the documentation.

---------Credits and Usage----------
RETRO is, and shall always be, free to use in any RPG Maker MV project,
commercial or otherwise, provided proper credit is given. RETRO shall
also always be free to obtain.

If you use RETRO in your project, please credit the following:
Drakkonis - Me. I started RETRO and am the primary devoloper.
Restart - Developer of FOSSIL, which is the direct inspiration for
    RETRO. While he has not directly contributed anything to RETRO,
    it literally would not have been started without his creation of
    FOSSIL, so I feel SOME credit is deserved.
OcRam - Contributed the necessary legwork to get his plugin
    collection working with RETRO. Also contributed a lot of
    programming insight that increased RETRO's efficiency. Also
    created the RETRO Plugin Command UI tool to make complex
    MZ plugin commands more user-friendly. While I'd like to think
    this kind of tool would exist eventually anyway, it exists now
    because of him.
*/

/*~struct~cmd:
@param plugName
@text Plugin Name
@desc Name of the plugin used in this shortcut.

@param plugCmd
@text Command Name
@desc Name of of the command used in this shortcut.

@param plugArgs
@text Argument Shortcuts
@desc Array of argument shortcuts for this command shortcut. Use MZargX after the command name, where X is the index number.
@type text[]
*/
"use strict";

const Retro = PluginManager.parameters('RETRO');
Retro.skin = {};
Retro.gaugeOverride = Retro.gaugeOverride == "true";
Retro.MZPlugins = {}; //MZ plugin command information

//assembles MZ plugin command shortcut information
Retro.cmds = Retro.cmds || {}; //RETRO update compatibility
let RetroTemp = []; JSON.parse(Retro.cmds).forEach(c => {c = (JSON.parse(c));
    if (c.plugArgs) c.plugArgs = JSON.parse(c.plugArgs); RetroTemp.push(c);
}); Retro.cmds = RetroTemp; RetroTemp = null;

Retro.overwrites = {
    statusGauge: {
        label: "MV", labelColor: "MV", valueColor: "MV",
        gaugeColor1: "MV", gaugeColor2: "MV"
    }
};

PluginManager.MZ_commands = {}; //Plugin command information from MZ's registerCommand.

//aliased functions for general compatibility
const MV_SceneBoot_title = Scene_Boot.prototype.updateDocumentTitle;
const MV_PluginManager_setup = PluginManager.setup;
const MV_Command356 = Game_Interpreter.prototype.command356;
const MV_PluginCommand = Game_Interpreter.prototype.pluginCommand;
const MV_MenuBase_help = Scene_MenuBase.prototype.createHelpWindow;
const MV_WindowBase_init = Window_Base.prototype.initialize;
const MV_WindowBase_contents = Window_Base.prototype.createContents;
const MV_WindowHelp_init = Window_Help.prototype.initialize;
const MV_ActorGaugeHP = Window_Base.prototype.drawActorHp;
const MV_ActorGaugeMP = Window_Base.prototype.drawActorMp;
const MV_ActorGaugeTP = Window_Base.prototype.drawActorTp;
const MV_BattlerBase_init = Game_BattlerBase.prototype.initialize;
const MV_EquipDrawItem = Window_EquipSlot.prototype.drawItem;
const MV_ProcNormChar = Window_Base.prototype.processNormalCharacter;
const MV_ImageManager_loadNormBit = ImageManager.loadNormalBitmap;
const MV_SceneBoot_start = Scene_Boot.prototype.start;
const MV_TouchInput_clear = TouchInput.clear;
const MV_SceneBoot_isReady = Scene_Boot.prototype.isReady;
const MV_BattleManager_changeActor = BattleManager.changeActor;

//aliased functions for specific plugin compatibility
const MV_WindowBase_textColor = Window_Base.prototype.textColor;

//completely custom functions
Retro.getPluginData = function(plugin) {if (plugin == "RETRO") return;
    const params = this.parsePlugin(plugin); let data = {}, MZ = false, cmd = "", arg = "";
    while (params.length > 0) {
        if (params[0].includes("@target" && "MZ")) MZ = true, params.shift();
        else if (params[0].includes("@base")) {const base = params[0].slice(6);
            if (!this.MZPlugins.hasOwnProperty(base)) alert(base + " must be present and above " + plugin + " in the plugin list!");
            params.shift();
        } else if (params[0].includes("@orderBefore")) {const base = params[0].slice(13)
            if (this.MZPlugins.hasOwnProperty(base)) alert(base + " must be below " + plugin + " in the plugin list!");
            params.shift();
        } else if (params[0].includes("@orderAfter")) {const base = params[0].slice(12)
            if (!this.MZPlugins.hasOwnProperty(base) && PluginManager._scripts.includes(base)) {
                alert(base + " must be above " + plugin + " in the plugin list!");
            }; params.shift();
        } else if (params[0].includes("@command")) {let range = this.getRange(params);
            while (range > 0) {
                switch (params[0].slice(0, 4)) {
                    case "@com": cmd = params[0].slice(9).replace(/\s+/g, "_"); data[cmd] = {};
                        data[cmd].func = PluginManager.MZ_commands[plugin][cmd];
                        data[cmd].args = []; data[cmd].defs = {}; data[cmd].types = {}; break;
                    case "@arg": arg = params[0].slice(5); data[cmd].args.push(arg); break;
                    case "@def": data[cmd].defs[arg] = params[0].slice(9); break;
                    case "@typ": data[cmd].types[arg] = params[0].slice(6); break;
                }; range--; params.shift();
            };
        } else params.shift();
    }; if (MZ) Retro.MZPlugins[plugin] = data, MZ = false;
};

Retro.loadPluginText = function (pluginName, suc_cb, err_cb) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                suc_cb.call(this, xhr.responseText);
            } else {
                err_cb.call(this, xhr.statusText);
            }
        }
    }; xhr.open("GET", './js/plugins/' + pluginName + '.js', false); xhr.send(null);
};

Retro.parsePlugin = function (pluginName) {
    const params = []; let lines = [];
    this.loadPluginText(pluginName,
        contents => {
            lines = contents.split('\n');
            lines.forEach(l => {
                l = l.trim();
                if (l.includes("@")) {
                    if (l.charAt(0) == "*") {l = l.slice(1); l = l.trim()};
                    if (l.charAt(0) == "@") params.push(l), l = null;
                } else if (l.includes("/")) {
                    if (l.indexOf("/") !== 0 && l.charAt(l.indexOf("/") - 1) == "*") {//end of non-structure section
                        return;
                    };
                };
            });
        },
        status => {
            console.error(status);
        }
    ); this.scanPlugin(pluginName, lines.filter(line => line.match(/=\s*function\s*\(/g) || line.contains("registerCommand")));
    return params;
};

Retro.scanPlugin = function(plugin, data) {
    let MZfilter = ["Sprite_Gauge"];
    let MVfilter = ["Color"];
    let commands = data.filter(d => d.contains("registerCommand"));
    if (plugin.contains("CGMZ")) {//command data retrieval for plugins with a different registerCommand setup(non-async timing)
        commands.forEach(cmd => {
            cmd = cmd.slice(cmd.indexOf("(") + 1, cmd.indexOf(")"));
            cmd = cmd.split(","); cmd = cmd.map(c => c.replaceAll('"', "").trim())
            PluginManager.MZ_commands[cmd[0]] = PluginManager.MZ_commands[cmd[0]] || {};
            const key = cmd[1].replace(/\s+/g, "_")
            if (cmd[0].slice(0, 4) == "CGMZ") PluginManager.MZ_commands[cmd[0]][key] = window["CGMZ_Temp"].prototype[cmd[2].slice(5)];
            else PluginManager.MZ_commands[cmd[0]][key] = window[cmd[2]]; //dummy branch, for future compatibility requirements
        });
    };

    data = data.filter(d => {let match = false; MZfilter.forEach(f => {if (d.contains(f)) match = true}); return match});
    if (data.length > 0) data.forEach(d => {d = d.slice(23, d.indexOf("=")).trim(); Retro.overwrites.statusGauge[d] = "MZ"});
    else data = data.filter(d => {let match = false; MVfilter.forEach(f => {if (d.contains(f)) match = true}); return match});
    if (data.length > 0) data.forEach(d => {
        if (d.contains("Window_Base.prototype")) {d = d.slice(22, d.indexOf("=")).trim();
            if (d.contains("GaugeColor1")) Retro.overwrites.statusGauge.gaugeColor1 = "MV";
            if (d.contains("GaugeColor2")) Retro.overwrites.statusGauge.gaugeColor2 = "MV";
            if (d == "systemColor") Retro.overwrites.statusGauge.labelColor = "MV";
            if (d.contains("hpColor") || d.contains("mpColor") || d.contains("tpColor")) Retro.overwrites.statusGauge.labelColor = "MV";
        }
    })
}

Retro.getRange = function(params) {
    let range = 1; 
    for (let i = 1; i < params.length; i++) {
        if (params[i].includes("@help") || params[i].includes("@param") || params[i].includes("@command")) return range
        else range++
    }; return range;
};

Retro.cmdShort = function(cmd) {let i = Number(cmd.slice(5, 6));
    if (Retro.cmds.length < i) {console.warn("Command shortcut " + cmd + " does not exist!"); return}
    else {i--; const plug = Retro.cmds[i].plugName, com = Retro.cmds[i].plugCmd;
        if (!Retro.MZPlugins.hasOwnProperty(plug)) {console.warn(plug + " is not imported!"); return}
        else if (!Retro.MZPlugins[plug].hasOwnProperty(com)) {console.warn("Command " + com + " does not exist in " + plug + "!"); return}
        else {
            let arg = cmd.slice(6).trim(); cmd = cmd.split(" "); cmd.shift();
            if (cmd[0] && cmd[0].slice(0, 5) == "MZarg") {let j = Number(cmd[0].slice(5, 6))
                if (Retro.cmds[i].plugArgs.length < j) {
                    console.warn("Argument shortcut " + cmd[0] + " does not exist for plugin command " + com + "!"); return;
                } else j--, arg = Retro.cmds[i].plugArgs[j];
            }
            cmd = plug + "/" + com; if (arg) cmd += " " + arg;
            return cmd;
        }
    };
};

Retro.MZ_PluginCommand = function (command, args, interpreter) {
    command = command.split("/"); if (!this.MZPlugins[command[0]]) { console.warn(command[0] + " is not imported!"); return }
    command = this.MZPlugins[command[0]][command[1]]; let arg = {};
    if (command.args.length > 0) {args = this.processArgs(args);
        for (let i = 0; i < command.args.length; i++) {
            const key = command.args[i];
            if (args.length - 1 < i) args.push("");
            if (args[i] == "" && command.defs.hasOwnProperty(key)) arg[key] = command.defs[key]
            else arg[key] = args[i] == "\\_" ? "" : args[i];
        };
    }; command.func.bind(interpreter)(arg);
};

Array.prototype.replaceAll = function(search, replace) {let ret = [];
    this.forEach(a => {ret.push(a.replaceAll(search, replace))}); return ret;
};

Retro.processArgs = function(args) {
    let temp = "", i = 0;
    args = args.replaceAll(/\\"/, "\\x22"); //substitutes escaped double quotes
    for (i = 0; i < args.length; i++) {
        if (args[i].charAt(0) == '"') {//double quotes to denote a single string arg containing spaces
            for (let i2 = i; i2 < args.length; i2++) {
                temp += " " + args[i2]; args[i2] = ""; //adds next array value and empties it since we no longer need it
                if (temp.charAt(temp.length - 1) == '"') {args[i] = temp.slice(2, temp.length - 1); break}; //slices off quotes and stores final value
            };
        } else if (args[i].charAt(0) == "[") {//straight brackets denotes an array arg
            for (let i2 = i; i2 < args.length; i2++) {
                temp += " " + args[i2]; args[i2] = "";
                if (temp.charAt(temp.length - 1) == "]") {args[i] = this.processArgArray(temp.slice(2, temp.length - 1)); break};
            }
        } else if (args[i].charAt(0) == "{") {//curly brackets denotes an object arg
            for (let i2 = i; i2 < args.length; i2++) {
                temp += ' ' + args[i2]; args[i2] = ""; //adds next array value and empties it since we no longer need it
                if (temp.charAt(temp.length - 1) == "}") {args[i] = this.processArgObject(temp.slice(2, temp.length - 1)); break}; //slices off brackets and stores final value
            };
        }; args[i] = args[i].replace(/\\x22/g, '\"'); temp = ""; //replaces escaped double quotes in final arg value
    }; args =  args.filter(a => a.length > 0);
    for (i = 0; i < args.length; i++) {if (args[i] == "_") args[i] = ""};
    return args;
};

Retro.processArgArray = function(arg) {
    arg = arg.split(","); return JSON.stringify(this.processArgs(arg));
}

Retro.processArgObject = function(arg) {
    let obj = {}; arg = arg.split(",")//split property/value pairs into an array
    for (let i = 0; i < arg.length; i++) {
        if (arg[i].charAt(arg[i].indexOf(":") + 2) == "[") {let idx = i + 1;
            while (!arg[i].contains("]")) {arg[i] += "," + arg[idx]; arg[idx] = ""; idx++};
            idx = arg[i].indexOf(":") + 2;
            arg[i] = arg[i].slice(0, idx) +  this.processArgArray(arg[i].slice(idx + 1, arg[i].length - 2));
        };
    }; arg = arg.filter(a => a.length > 0);
    arg.forEach(a => {let t = a.split(":"); obj[t[0].trim().replace(/"/g,"")] = t[1].trim().replace(/"/g,"")}); //create object from pair array
    return JSON.stringify(obj);//returns JSON version of the final object
};

Retro.findCaller = function() { //figures out exactly WHAT has called the function that this function was called from
    const err = new Error(); let file = "";
    const stack = err.stack.split("at ").shift();
    for (let i = 0; i < stack.length; i++) {
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

Game_Interpreter.prototype.command356 = function() {//detects MZ command shortcuts and swaps in the real command.
    const cmd =  this._params[0].split(" ")[0];
    if (cmd.slice(0, 5) == "MZcmd") this._params[0] = Retro.cmdShort(this._params[0]);
    return MV_Command356.call(this);
};

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (command.includes("/")) Retro.MZ_PluginCommand(command, args, this);
    else MV_PluginCommand.call(this, command, args);
};

PluginManager.registerCommand = function(pluginName, commandName, func) {
    if (pluginName.contains("CGMZ")) return;
    this.MZ_commands[pluginName] = this.MZ_commands[pluginName] || {};
    this.MZ_commands[pluginName][commandName.replace(/\s+/g, "_")] = func;
};

//window construction

Game_System.prototype.windowPadding = function() {return Window_Base.prototype.standardPadding()};
Window.prototype.addInnerChild = function(child) {this.addChildToBack(child)};

Object.defineProperty(Window.prototype, "innerRect", {
    get: function() {
        return new Rectangle(
            this.padding, this.padding,
            this.contentsWidth(), this.contentsHeight()
        );
    },
    configurable: true
});

Window_Base.prototype.initialize = function(...args) {
    let x, y, width, height;
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
    if (this._actor) {const rect = this.itemRectForText(index);
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
Sprite_Gauge.prototype.currentValue = function() {return this._battler[this._statusType]};
Sprite_Gauge.prototype.currentMaxValue = function() {
    return this._statusType = "tp" ? this._battler.maxTp() : this._battler["m" + this._statusType]
};
Sprite_Gauge.prototype.isMod = function() { //if there are no Sprite_Gauge functions for this gauge, no overwrite will be processed
    let mod = this.label();
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
    let gColor1, gColor2, lColor, lText, vColor1, vColor2, val;
    gColor1 = battler[type + "_gauge"].gaugeColor1() || this[type + "GaugeColor1"]();
    gColor2 = battler[type + "_gauge"].gaugeColor2() || this[type + "GaugeColor2"]();
    lColor = battler[type + "_gauge"].labelColor() || this.systemColor();
    lText = battler[type + "_gauge"].label() || TextManager[type + "A"];
    vColor1 = battler[type + "_gauge"].valueColor() || this[type + "Color"](battler);
    val = battler[type + "Rate"]();
    this.drawGauge(x, y, width, val, gColor1, gColor2);
    this.changeTextColor(lColor); this.drawText(lText, x, y, 44);
    if (!type == "tp") {this.drawCurrentAndMax(battler[type], battler["m" + type], x, y, width, vColor1, vColor2)}
    else {this.changeTextColor(vColor1); this.drawText(battler.tp, x + width - 64, y, 64, 'right')};
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
    let bitmap = MV_ImageManager_loadNormBit.call(this, path, hue)
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
        const c = textState.text[textState.index++]; textState.x += this.textWidth(c);
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

function Sprite_Clickable() {this.initialize(...arguments)}
Sprite_Clickable.prototype = Object.create(Sprite_Button.prototype); Sprite_Clickable.prototype.constructor = Sprite_Clickable;
Sprite_Clickable.prototype.initialize = function() {Sprite.prototype.initialize.call(this)};
Sprite_Clickable.prototype.callClickHandler = function() {this.onClick()};
Sprite_Clickable.prototype.getWidth = function() {return this.scale ? this.width * this.scale.x : this.width};
Sprite_Clickable.prototype.getHeight = function() {return this.scale ? this.height * this.scale.y : this.height};
Sprite_Clickable.prototype.onMouseEnter = function() {}; Sprite_Clickable.prototype.onMouseExit = function() {};
Sprite_Clickable.prototype.onPress = function() {}; Sprite_Clickable.prototype.onClick = function() {};

Sprite_Clickable.prototype.isButtonTouched = function() {
    const x = this.canvasToLocalX(TouchInput.x), y = this.canvasToLocalY(TouchInput.y);
    const w = this.getWidth(), h = this.getHeight(); return x >= 0 && y >= 0 && x < w && y < h;
};

Sprite_Clickable.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (this.isMouseOver()) {if (!this._hovered) this._hovered = true, this.onMouseEnter()}
    else {if (this._hovered) this._hovered = false, this.onMouseExit()}
    this.processTouch();
};

Sprite.prototype.isMouseOver = function() {
    const x = TouchInput.mousePos.x, y = TouchInput.mousePos.y;
    return new Rectangle(this.x, this.y, this.getWidth(), this.getHeight()).contains(x, y)
}

TouchInput._onMouseMove = function(event) { //records location of touchinput even when not triggered, for mouseEnter/mouseExit functions
    const x = Graphics.pageToCanvasX(event.pageX), y = Graphics.pageToCanvasY(event.pageY);
    this.mousePos = {x: x, y: y}
    if (this._mousePressed) this._onMove(x, y);
};

TouchInput.clear = function() {MV_TouchInput_clear.call(this); this.mousePos = {x: 0, y: 0}};

Window_SavefileList.prototype.indexToSavefileId = function(index) {
    return index + 1;
};

//Functions contributed by OcRam
if (!''.matchAll) { // String.matchAll polyfill
    String.prototype.matchAll = function (rex) {
        const ret = [];
        while (true) {
            const res = rex.exec(this);
            if (!res) break; ret.push(res);
        } return ret;
    };
}

if (!''.replaceAll) { // String.replaceAll polyfill
    String.prototype.replaceAll = function (search_string, replace_string) {return this.split(search_string).join(replace_string)};
};

if (![].remove) { // Array.remove polyfill
    Array.prototype.remove = function (item) {
        const idx = this.indexOf(item);
        if (idx > -1) this.splice(idx, 1);
        return this;
    };
}

function Sprite_AnimationMV() {this.initialize.apply(this, arguments)}
Sprite_AnimationMV.prototype = Object.create(Sprite_Animation.prototype);
Sprite_AnimationMV.prototype.constructor = Sprite_AnimationMV;

Game_System.prototype.mainFontFace = function () {return Window_Base.prototype.standardFontFace()};
Game_System.prototype.mainFontSize = function () {return Window_Base.prototype.standardFontSize()};
Window_Base.prototype.itemPadding = function () {return Window_Base.prototype.standardPadding()};

Scene_Menu.prototype.goldWindowRect = function () {
    return {
        x: this._goldWindow.x, y: this._goldWindow.y,
        width: this._goldWindow.width, height: this._goldWindow.height
    };
};

Object.defineProperty(Tilemap.prototype, '_bitmaps', {
    get: function () {return this.bitmaps},
    set: function (value) {this.bitmaps = value},
    configurable: true
});

function Window_NameBox() { this.initialize.apply(this, arguments) }
Window_NameBox.prototype = Object.create(Window_Base.prototype);
Window_NameBox.prototype.constructor = Window_NameBox;
Window_NameBox.prototype.setName = () => {};
Window_NameBox.prototype.start = () => {};
Object.defineProperty(Window_Base.prototype, '_nameBoxWindow', {
    get: function () {
        return new Window_NameBox();
    }, set: function (value) { },
    configurable: true
});

WebAudio.prototype.destroy = function () {this.stop()};

PluginManager.callCommand = function (self, pluginName, commandName, args) {
    if (!Retro.MZPlugins[pluginName]) {console.warn(pluginName + " is not imported!"); return}
    const func = this.MZ_commands[pluginName][commandName];
    if (typeof func === "function") {func.bind(self)(args)};
};

Game_Interpreter.prototype.executeCommand = function () {
    const command = this.currentCommand();
    if (command) {this._params = command.parameters; this._indent = command.indent;
        const methodName = 'command' + command.code;
        if (typeof this[methodName] === 'function') {
            if (!this[methodName](this._params)) {return false}; // this._params as function parameters!
        }; this._index++;
    } else {this.terminate()};
    return true;
};

function Scene_Message() { this.initialize.apply(this, arguments) }
Scene_Message.prototype = Object.create(Scene_Base.prototype); Scene_Message.prototype.constructor = Scene_Message;

Scene_Map.prototype.onMapTouch = function () {
    const x = $gameMap.canvasToMapX(TouchInput.x); const y = $gameMap.canvasToMapY(TouchInput.y);
    $gameTemp.setDestination(x, y);
};

Scene_Map.prototype.isAnyButtonPressed = function () {return TouchInput.isCancelled()};

for (const cmd in Game_Interpreter.prototype) {
    if (cmd.substr(0, 7) == "command") {const old_func = Game_Interpreter.prototype[cmd];
        Game_Interpreter.prototype[cmd] = function (p) {if (p) this._params = p; return old_func.call(this)};
    }
};

Tilemap.prototype._addAllSpots = function (startX, startY) {
    const tileCols = Math.ceil(this._width / this._tileWidth) + 1, tileRows = Math.ceil(this._height / this._tileHeight) + 1;
    for (let y = 0; y < tileRows; y++) {for (let x = 0; x < tileCols; x++) {this._paintTiles(startX, startY, x, y)}}
};

Tilemap.prototype._paintAllTiles = function (startX, startY) {this._addAllSpots(startX, startY)};

ShaderTilemap.prototype._paintAllTiles = function (startX, startY) {
    this.lowerZLayer.clear(); this.upperZLayer.clear(); this._addAllSpots(startX, startY);
};

Scene_Boot.prototype.isReady = function () {
    const ret = MV_SceneBoot_isReady.call(this);
    if (ret) this.onDatabaseLoaded(); return ret;
};

Scene_Boot.prototype.onDatabaseLoaded = function () {};

Bitmap.prototype.destroy = function () {this._clearImgInstance()};

Object.defineProperty(ImageManager, '_cache', { // EDITED 2021/05/18 20:30
    get: function () {
        const ret = {};
        for (const key in this._imageCache._items) {
            const bm = this._imageCache._items[key].bitmap;
            ret[key.split(":")[0]] = bm;
        } return ret;
    },
    set: function (value) { },
    configurable: true
});


BattleManager.changeActor = function () {
    const ret = MV_BattleManager_changeActor.apply(this, arguments);
    this.startActorInput(); return ret;
}; 

BattleManager.startActorInput = function () {};//startActorInput = when actor is ready for input

Object.defineProperty(BattleManager, '_currentActor', {//In MZ there's _currentActor - ToDo assign this._actorIndex based on given actor
    get: function () {return this.actor()},
    set: function (actorIndex) {this._actorIndex = actorIndex},
    configurable: true
});


//Compatibility functions
//note: the functions here are only if they need to be modified to allow a certain plugin to work, and not needed otherwise.
//If a function is already modified for RETRO functionality in general, any specific compatibility requirements will be there instead.

Window_Base.prototype.textColor = function(n) {
    if (n > 31 && Imported.CGMZ_InfiniteColors) return ColorManager.textColor(n);
    return MV_WindowBase_textColor.call(this, n);
};