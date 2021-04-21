/*:
@author Drakkonis
@plugindesc This plugin aims to make most MZ plugins compatible with MV.
@version 0.01

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
function.

Windows in MV are created with location and size parameters, and in MZ
are created with a special object that contains those parameters. All
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

Currently known incompatible features:

Custom scenes are more "modular" in MZ, where in MV they are less so.
There are a lot of functions missing as a result, and blindly adding them
in creates a bit of a frankenstein mess. I'm still working on this bit,
so it's not included in this release. Even so, the current strategy will
cause at least some of the custom scenes to look different between the
two engines even with identical plugins, but they should fit with MV's
normal aesthetic and still be fully functional.

PIXI - I know that MV and MZ uses different versions of PIXI, so anything
using the newer PIXI will likely remain incompatible. TBH, I don't fully
understand what PIXI is, so anything involving PIXI will likely either
be outsourced or be one of the last things implemented.
*/

const ColorManager = {}; //ColorManager doesn't exist at ALL in MV.
PluginManager.MZ_commands = {}; //MZ's PluginMananger commands.
PluginManager.args = {} //MZ's Plugin Command args.

//aliased functions
MV_PluginCommand = Game_Interpreter.prototype.pluginCommand;
MV_WindowBase_init = Window_Base.prototype.initialize;
MV_WindowHelp_init = Window_Help.prototype.initialize;

ColorManager.textColor = function(n) {
    this._skin = this._skin || new Window_Base();
    return this._skin.textColor(n);
};

//plugin command functions

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