/*:
@target MZ
@plugindesc Limit Breaker v1.00
@author Drakkonis

@param partyParams
@text ----Party Parameters----
@desc These parameters deal with the entire party.

@param battlerParams
@text ----Battler Parameters----
@desc These parameters are for battlers, whether they are actors or enemies.

@param battleParams
@text ----Battle Parameters----
@desc These parameters are for functions specifically related to battle.

@param miscParams
@text ----Misc. Parameters----
@desc These are miscellaneous parameters that don't belong in any other group.

@param MaxBuff
@parent battleParams
@type number
@text Buff Maximum
@desc Maximum number of times a battler parameter can be buffed.
@default 2

@param MinBuff
@parent battleParams
@type number
@text Debuff Maximum
@desc Maximum number of times a battler parameter can be debuffed.
@default -2

@param NearDeath
@parent battlerParams
@type number
@text Near Death
@desc Percentage of max health a battler must be under to be considered near death.
@default 25

@param MaxTP
@parent battlerParams
@type integer
@text TP Maximum
@desc Maximum TP a battler can have.
@default 100

@param TPCharge
@parent battlerParams
@type boolean
@text Charge TP With Damage
@desc Sets whether a battler will gain TP when taking damage.
@default true

@param InitTPType
@parent battlerParams
@type select
@option Fixed
@option Random
@option Fixed Variable
@option Random Variable
@text Initial TP Mode
@desc Sets whether the game grants a fixed or randomized amount of TP at the beginning of battle.
@default Random

@param InitTPVal
@parent battlerParams
@type number
@text Initial TP Value
@desc Sets the amount of TP granted at the beginning of a battle.
@default 25

@param MaxItems
@parent partyParams
@type number
@text Item Maximum
@desc How many of a given item your party can hold.
@default 99

@param MaxGold
@parent partyParams
@type number
@text Gold Maximum
@desc How much gold the party can carry.
@default 99999999

@param MaxMem
@parent partyParams
@type number
@text Party Size Maximum
@desc How many members can be in your party.
@default 4

@param MaxSaves
@parent miscParams
@type number
@text Save Slots Maximum
@desc How many save slots your player can have.
@default 20

@help
RPG Maker MZ comes with various hard-coded limits that the developer can't
change in the main editor. Some plugins allow you to change or bypass
certain limits, but usually only the limits that pertain to the plugin's
scope. This plugin aims to allow developers to change these limits to
whatever they want.
 
All you have to do is set the parameters for whatever limits you want to
change, and you're done! And if there are some options you don't want
changed, the default settings correspond to MZ's original values.

For Initial TP Value settings:
If TP Mode is fixed, it will grant this amount. If TP mode is random,
it will grant up to this amount. For Fixed Variable and Random Variable,
this will be the game variable used for those modes instead.

WARNING: This plugin will most likely not be compatible with any other
plugins that modify these limits or how they're processed.

Usage Notes: This plugin only allows changes to certain settings that the
default editor won't give you access to. It doesn't guarantee that those
values won't cause problems further down the line, usually display issues
with really big numbers on things like gold and items. If you run into
a problem like that, it's your problem to solve. I recommend toning the
values down to something that works, or finding/writing a plugin that will
rectify the problem. Just keep in mind that there are probably a lot of
things set up in MZ's default code that had the hard-coded limits in mind.
Things might get weird when some of those limits are user-defined.

Special Note: This pertains to the Party Maximum parameter. If you choose to
to have this parameter set higher than 4, you'll note a few things if you
actually get more than 4 actors in your party.

Normally, your party can be as large as you choose, but the number at a time
in battle is capped at 4, and the Formation command in the main menu is used
to choose which 4 those are. Your followers on the world map follows your
formation.

But if you set this Party Maximum higher than 4, and get more than 4 in your
party, your extra party members ARE considered part of the active party, and
your map followers will reflect this. The extra members are also selectable
in battle as skill targets, by pressing down when selecting a party member
as a target. However, when it's time for a member after the first 4 to pick
a command, there isn't anything to indicate whose turn it actually is.

A remedy for this issue is currently beyond the scope of this plugin, so if
you set Party Maximum over 4, I recommend having another plugin that can
take care of larger party sizes. I hope to eventually have a fix for this.
*/

var Imported = Imported || {};
Imported.Drak_LimitBreaker = true;
var Drak = Drak || {};
Drak.LB = Drak.LB || {};
Drak.LB.version = 1.00;

Drak.Parameters = PluginManager.parameters('Drak_LimitBreaker');
Drak.Param = Drak.Param || {};

Drak.Param.MaxBuff = parseInt(Drak.Parameters['MaxBuff']);
Drak.Param.MinBuff = parseInt(Drak.Parameters['MinBuff']);
Drak.Param.MaxTP = parseInt(Drak.Parameters['MaxTP']);
Drak.Param.Dying = parseInt(Drak.Parameters['NearDeath']) * .01;
Drak.Param.TPCharge = Boolean(Drak.Parameters['TPCharge']);
Drak.Param.TPType = Drak.Parameters['InitTPType'];
Drak.Param.TPVal = parseInt(Drak.Parameters['InitTPVal']);
Drak.Param.MaxItems = parseInt(Drak.Parameters['MaxItems']);
Drak.Param.MaxGold = parseInt(Drak.Parameters['MaxGold']);
Drak.Param.MaxMembers = parseInt(Drak.Parameters['MaxMem']);
Drak.Param.MaxSaves = Number(Drak.Parameters['MaxSaves']);

//var _MaxBuff = Game_BattlerBase.prototype.isMaxBuffAffected;
//var _MinBuff = Game_BattlerBase.prototype.isMaxDeBuffAffected;
//var _MaxTP = Game_BattlerBase.prototype.maxTp;
//var _Dying = Game_BattlerBase.prototype.isDying;
//var _OnDamage = Game_Battler.prototype.OnDamage;
//var _initTP = Game_Battler.prototype.initTp;
//var _MaxItems = Game_Party.prototype.maxItems;
//var _MaxMembers = Game_Party.prototype.maxBattleMembers;
//var _MaxSaveFiles = DataManager.maxSavefiles;

Game_BattlerBase.prototype.isMaxBuffAffected = function(paramId) {
    return this._buffs[paramId] === Drak.Param.MaxBuff;
};

Game_BattlerBase.prototype.isMaxDeBuffAffected = function(paramId) {
    return this._buffs[paramId] === Drak.Param.MinBuff;
};

Game_BattlerBase.prototype.maxTp = function() {
    return Drak.Param.MaxTP;
};

Game_BattlerBase.prototype.isDying = function() {
    return this.isAlive() && this._hp < this.mhp * Drak.Param.Dying;
};

Game_Battler.prototype.onDamage = function(value) {
    this.removeStatesByDamage();
    if (Drak.Param.TPCharge){
        this.chargeTpByDamage(value / this.mhp);
    }
};

Game_Battler.prototype.initTp = function() {
    switch (Drak.Param.TPType) {
        case 'Fixed':
            this.setTp(Drak.Param.TPVal);
            break;
        case 'Random':
            this.setTp(Math.randomInt(Drak.Param.TPVal));
            break;
        case 'Fixed Variable':
            this.setTp(Math.trunc(Number($gameVariables.value(Drak.Param.TPVal))));
            break;
        case 'Random Variable':
            this.setTp(Math.randomInt(Math.trunc(Number($gameVariables.value(Drak.Param.TPVal)))));
            break;
    }
};

Game_Party.prototype.maxItems = function(/*item*/) {
    return Drak.Param.MaxItems;
};

Game_Party.prototype.maxGold = function() {
    return Drak.Param.MaxGold;
};

Game_Party.prototype.maxBattleMembers = function() {
    return Drak.Param.MaxMembers;
};

DataManager.maxSavefiles = function() {
    return Drak.Param.MaxSaves;
};