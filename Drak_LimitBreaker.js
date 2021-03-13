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

@param statParams
@parent battlerParams
@text ---Stat Parameters---
@desc These parameters are for battler stats.

@param TPParams
@parent battlerParams
@text ---TP Parameters---
@desc These parameters are for the TP system.

@param battleParams
@text ----Battle Parameters----
@desc These parameters are for functions specifically related to battle.

@param miscParams
@text ----Misc. Parameters----
@desc These are miscellaneous parameters that don't belong in any other group.

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
@text Battle Group Size Maximum
@desc How many party members can be in your battle group.
@default 4

@param BenchXP
@parent partyParams
@type number
@text Bench Experience Rate
@desc Percentage of earned experience points a party member receives if they are not in the battle group.
@default 100

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
@default 2

@param BuffRate
@parent battleParams
@type number
@text Buff Rate
@desc Percentage that each level of buff or debuff affects battler parameters.
@default 25

@param RevType
@parent battleParams
@type select
@option Fixed
@option Random
@option Percentage
@option Fixed Variable
@option Random Variable
@option Percentage Variable
@text Revival Type
@desc When you revive something, this determines how it chooses what HP to set the revived object to.
@default Fixed

@param RevNum
@parent battleParams
@type number
@text Revival Value
@desc When setting HP amount during revival, this value is used based on the chosen Revival Type.
@default 1

@param CritRate
@parent battleParams
@type number
@text Critical Damage Rate
@desc When damage is calculated as a critical hit, the damage is modified by this percent.
@default 300

@param AtkID
@parent battlerParams
@type number
@text Attack Skill ID
@desc Skill ID for the basic attack command.
@default 1

@param GrdID
@parent battlerParams
@type number
@text Guard Skill ID
@desc Skill ID for the basic guard command.
@default 2

@param KOState
@parent battlerParams
@type number
@text Death/KO State ID
@desc State ID for when a battler reaches 0 HP.
@default 1

@param NearDeath
@parent battlerParams
@type number
@text Near Death
@desc Percentage of max health a battler must be under to be considered near death.
@default 25

@param MaxHP
@parent statParams
@type number
@text HP Maximum
@desc Maximum hit points a battler can have. Use 0 for no cap.
@default 0

@param MaxMP
@parent statParams
@type number
@text MP Maximum
@desc Maximum magic points a battler can have. Use 0 for no cap.
@default 0

@param MaxTP
@parent TPParams
@type integer
@text TP Maximum
@desc Maximum TP a battler can have.
@default 100

@param MaxATK
@parent statParams
@type number
@text Attack Maximum
@desc Maximum attack a battler can have. Use 0 for no cap.
@default 0

@param MaxDEF
@parent statParams
@type number
@text Defense Maximum
@desc Maximum defense a battler can have. Use 0 for no cap.
@default 0

@param MaxMATK
@parent statParams
@type number
@text Magic Attack Maximum
@desc Maximum magic attack a battler can have. Use 0 for no cap.
@default 0

@param MaxMDEF
@parent statParams
@type number
@text Magic Defense Maximum
@desc Maximum magic defense a battler can have. Use 0 for no cap.
@default 0

@param MaxAGL
@parent statParams
@type number
@text Agility Maximum
@desc Maximum agility a battler can have. Use 0 for no cap.
@default 0

@param MaxLuck
@parent statParams
@type number
@text Luck Maximum
@desc Maximum Luck a battler can have. Use 0 for no cap.
@default 0

@param TPCharge
@parent TPParams
@type boolean
@text Charge TP With Damage
@desc Sets whether a battler will gain TP when taking damage.
@default true

@param InitTPType
@parent TPParams
@type select
@option Fixed
@option Random
@option Percentage
@option Fixed Variable
@option Random Variable
@option Percentage Variable
@text Initial TP Mode
@desc Sets whether the game grants a fixed or randomized amount of TP at the beginning of battle.
@default Random

@param InitTPVal
@parent TPParams
@type number
@text Initial TP Value
@desc Sets the amount of TP granted at the beginning of a battle.
@default 25

@param MaxSaves
@parent miscParams
@type number
@text Save Slots Maximum
@desc How many save slots your player can have.
@default 20

@param MaxPic
@parent miscParams
@type number
@text Picture Maximum
@desc Sets how many pictures can be on screen at once.
@default 100

@help
RPG Maker MZ comes with various hard-coded limits that the developer can't
change in the main editor. Some plugins allow you to change or bypass
certain limits, but usually only the limits that pertain to the plugin's
scope. This plugin aims to allow developers to change these limits to
whatever they want.
 
All you have to do is set the parameters for whatever limits you want to
change, and you're done! And if there are some options you don't want
changed, the default settings correspond to MZ's original values.

Keep in mind, though, that any parameter settings are global. That is,
they affect all relevant objects. This really only applies to battlers,
which actors and enemies are both members of. This means that parameter
settings won't allow you to set different limits for actors and enemies,
or even different actors and enemies, they are ALL bound to these settings.

If you wish to change/bypass these limits for certain battlers, you can use
notetags with the battlers in question to specify different limits, and
those limits will be prioritized over the global ones for those battlers.
See the Notetags section for more information.

-------------------------------Parameters-------------------------------
This section explains the various parameters, any specific details, and
possible uses or effects. This section is aimed at new developers, those
new to RPG Maker MZ, and the like. People with a good grasp of how stuff
tends to work can probably skip this, they likely won't learn anything
new.

----Party Parameters----
These parameters affect things relating to the player party as a whole.
Specific members of the party and things specific to them are covered
in the battler section.

-Item Maximum-
This defines how many of a given item you can have. This doesn't affect
how many total items your party can have, only how many of an item.

-Gold Maximum-
Straightforward, how much money can your players have at one time?

-Battle Group Size Maximum-
This is how many party members can be in a battle at once. This is set
at 4 by default, but some developers would prefer smaller parties. If
you go bigger than 4, you'll have at least one interesting side effect.
There's a special note on this near the end of the help section, but
basically, don't set this above 4 unless you have some sort of plugin
that can handle more battle group members. I hope to have a solution
for this in a later update.

-Bench Experience Rate-
In the database settings, on the System 1 tab, there is an option
labeled "EXP For Reserve Members". If this setting is checked, actors
that are in your party but not in your battle group will gain experience
points too. By default, this is set at 100%, meaning that reserve
members would receive the exact same amount as the battle group. Most
games either don't allow experience sharing, or a lot of those that
do only allow reserve members to get a percentage of what the battle
group received. This parameter will define how much experience a bench
party member will get compared to a battle group member, but only
if the database setting is turned on.

----Battler Parameters----
These parameters affect "battlers", your playable characters and the
enemies they fight. As such, the parameters here affect their performance
in battle.

---Stat Parameters---
These parameters set maximum values for the labelled stat. When setting
up an actor class or an enemy, their base stats are defined in the
database. However, equipment and status effects can modify these values.
By default, there is no limit to how high these stats could go this way.
These parameters let you set absolute limits to how high a stat can go,
no matter how high something tries to increase them. If you set a parameter
to 0, it removes the cap for that parameter.

---TP Parameters---
These parameters affect TP, an optional extra mechanic in MZ. It can have
a number of uses from an extra resource for skills to a bedrock for a
limit break style mechanic. However, by default it's very hard to work
with and not very customizable. A random amount is granted at the start
of battle, it's gained when a battler takes damage based on how much
damage was taken, is capped at 100, and generally lost at the end of the
fight unless a certain flag is set. These parameters aim to give you MUCH
more control over the way TP is managed, if you choose to use TP at all.

-TP Maximum-
Self-explanatory.

-Charge TP With Damage-
With the default system, when a battler takes damage, they automatically
gain TP based on the damage they took, their max HP, and their TP charge
rate. This setting can disable that without having to set every battler's
TP charge rate to 0 manually.

-Initial TP Mode-
This parameter will define how starting TP is given at the start of each
battle. The value for the Initial TP Value will have different meanings
based on what you set this to.

-Initial TP Value-
What this parameter does will depend on what you set Initial TP Mode to.
If TP Mode is Fixed, it will grant this amount. If TP Mode is Random,
it will grant up to this amount. If TP Mode is Percentage, it will grant
this percentage of the battler's max TP. For Fixed Variable, Percentage
Variable, and Random Variable, this will be the game variable used for those
modes instead. Make sure that variable only holds a number.

-Attack Skill ID-
This is the skill used when "Attack" is selected in battle, unless a state
changes it while a battler is affected by it. There really isn't a need to
ever change this setting, as you can modify the skill to get whatever you
want the basic attack to be, but it's here anyway.

-Guard Skill ID-
Just like Attack Skill ID, this is the skill that gets used when "Guard" is
selected in battle, and there shouldn't ever be a situation where this needs
to be changed, but it's here if you want it.

-Death/KO State ID-
This is the state that gets assigned to a battler when their HP drops to 0.
Again, you should never need to change this, but in the spirit of what this
plugin is all about, it's here.

-Near Death-
This parameter defines what percentage of their max HP a battler must be
under to be considered "near death" or "dying." This really only affects
things that care about whether a battler is near death or not, so it's
really only useful to the more intermediate to advanced developers.

----Battle Parameters----
These parameters deal with the battle mechanics themselves, independent of
any individual battler.

-Buff and Debuff Maximum-
Some skills can "buff" or "debuff" a stat, raising or lowering it by an
amount defined by the Buff Rate. The buff/debuff count is a sliding scale,
meaning that buff and debuff counts aren't separate. If you buff a battler
that hasn't had any buffs or debuffs on that stat, their buff count becomes
1. If you then get a debuff on that same battler and the same stat, their
buff count goes to 0. If you get debuffed with a buff count of 2, it goes to
1. Same for the debuff side. A buff will reduce debuff counts, and vice
versa. These two parameters affect how far on each side this scale can go.

-Buff Rate-
This is how much each buff or debuff affects the respective parameter. It
is percentage based, so if this value is 25, a single buff gives you 25%
extra, level two gives 50% extra, and so on. It is recommended that you set
this to a low value if you plan to have high buff and debuff limits.

-Revival Type and Value-
By default, when a revive command is given or the death/KO state is removed
from a battler, their HP is simply set to 1. Any revive skills that want
to grant more HP on use would have to manually increase the target's HP
after reviving. These two settings allow more flexibility, and function 
exactly like the ones for the TP system so I won't repeat them here. These
settings affect the base behavior of revival, so if you have multiple revive
skills, take this into account.

-Critical Damage Rate-
If a skill does damage, and has Critical Hits enabled in the database, there
is a chance that skill will deal additional damage, modified by this
parameter. By default, a critical hit deals 300% of the damage it would have
otherwise dealt.

----Misc. Parameters----
These parameters don't fit in any other categories, so they're here in their 
own category.

-Save Slots Maximum-
By default, MZ gives a player 20 save slots, and if autosaving is enabled,
uses the first one for that. With this, you can give your player more, or
restrict them to fewer.

-Picture Maximum-
For performance and simplicity reasons, MZ only allows 100 different
pictures on-screen at a time using the picture commands. Most developers
shouldn't need to increase this value, and likely wouldn't need to reduce
it. But since this plugin is all about letting developers change MZ's
hard-coded limits and settings, here you go.

---------------------------------Notetags---------------------------------
This plugin has some notetag support, and will eventually have more. All
notetags in this plugin are intended to allow specific objects to have
their own limits, independent of the global settings. This means you can
have an actor with a lower cap than their class usually allows, or allow
an actor to not be constrained to the same limits as everything else. This
is best used for specific needs, for general use the global parameters are
usually the better choice.

Currently, only stat parameters and max TP can be set with notetags, and
only for battlers. In later versions of this plugin, I intend to have most,
if not all, settings in the parameters have notetag options, as well as
plugin and script commands to dynamically change the notetag options. A
good example of needing this would be a character that starts with low
stat caps, but through the story gains higher limits or even removes those
limits.

---How To Use Notetags---
To set up a custom limit on a relevant object, first you need to know
what limit you're putting on what object. Right now, only battler stat
settings can be set with notetags. This selection will expand in later
versions of this plugin.

Go to the database section for the battler you'd like to place limits on,
whether actor or enemy. On the bottom right of the page, there is a box
for notes. Notetags are written there in the format dictated by whatever
plugins you're using.

Now write there a notetag in this format: <MaxStat:X>, replacing Stat with
the stat you want to set, and X with the value you want to set the cap to,
following the same rules as their global parameter counterparts.
Example: <MaxTP:200> will set that battler's max TP to 200, no matter what
the global parameter is set to.

You can set as many stats as you wish this way, using a new tag for each
stat. The following are what you can replace Stat with:
HP - Max HP
MP - Max MP
ATK - Attack
DEF - Defense
MATK - Magic Attack
MDEF - Magic Defense
AGL - Agility
LUCK - Luck

For the more experienced developer, most notetag settings in this plugin
are actually setting their values in the object's metadata, and so could
potentially used in advanced scripting and function techniques that this
plugin doesn't do on its own.

WARNING: This plugin will most likely not be compatible with any other
plugins that modify these limits or how they're processed.

Usage Notes: This plugin only allows changes to certain settings that the
default editor won't give you access to. It doesn't guarantee that those
values won't cause problems further down the line, usually display issues
with really big numbers on things like gold and items. I recommend toning
the values down to something that works, or finding/writing a plugin that
will rectify the problem. Just keep in mind that there are probably a lot of
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

Version History:
v1.10 - Added picture cap and battler stat cap parameters.
        Added notetag support for battler stat cap overrides.
        Made the help section more complete and actually helpful.

v1.00 - Initial release
*/

var Imported = Imported || {};
Imported.Drak_LimitBreaker = true;
var Drak = Drak || {};
Drak.LB = Drak.LB || {};
Drak.LB.version = 1.10;

Drak.Parameters = PluginManager.parameters('Drak_LimitBreaker');
Drak.Param = Drak.Param || {};

Drak.Param.MaxBuff = parseInt(Drak.Parameters['MaxBuff']);
Drak.Param.MinBuff = -parseInt(Drak.Parameters['MinBuff']);
Drak.Param.MaxTP = parseInt(Drak.Parameters['MaxTP']);
Drak.Param.Dying = parseInt(Drak.Parameters['NearDeath']) * .01;
Drak.Param.TPCharge = Boolean(Drak.Parameters['TPCharge']);
Drak.Param.TPType = Drak.Parameters['InitTPType'];
Drak.Param.TPVal = parseInt(Drak.Parameters['InitTPVal']);
Drak.Param.MaxItems = parseInt(Drak.Parameters['MaxItems']);
Drak.Param.MaxGold = parseInt(Drak.Parameters['MaxGold']);
Drak.Param.MaxMembers = parseInt(Drak.Parameters['MaxMem']);
Drak.Param.MaxSaves = Number(Drak.Parameters['MaxSaves']);
Drak.Param.RevType = Drak.Parameters['RevType'];
Drak.Param.RevNum = parseInt(Drak.Parameters['RevNum']);
Drak.Param.BuffRate = parseInt(Drak.Parameters['BuffRate']) * .01;
Drak.Param.BenchXP = parseInt(Drak.Parameters['BenchXP']) * .01;
Drak.Param.MaxPic = parseInt(Drak.Parameters['MaxPic']);
Drak.Param.AtkID = parseInt(Drak.Parameters['AtkID']);
Drak.Param.GrdID = parseInt(Drak.Parameters['GrdID']);
Drak.Param.KoID = parseInt(Drak.Parameters['KOState']);
Drak.Param.Crit = parseInt(Drak.Parameters['CritRate']) * .01;
Drak.Param.MaxHP = parseInt(Drak.Parameters['MaxHP']);
Drak.Param.MaxMP = parseInt(Drak.Parameters['MaxMP']);
Drak.Param.MaxATK = parseInt(Drak.Parameters['MaxATK']);
Drak.Param.MaxDEF = parseInt(Drak.Parameters['MaxDEF']);
Drak.Param.MaxMATK = parseInt(Drak.Parameters['MaxMATK']);
Drak.Param.MaxMDEF = parseInt(Drak.Parameters['MaxMDEF']);
Drak.Param.MaxAGL = parseInt(Drak.Parameters['MaxAGL']);
Drak.Param.MaxLUCK = parseInt(Drak.Parameters['MaxLUCK']);

const Game_Actor_setup = Game_Actor.prototype.setup;
const Game_Enemy_setup = Game_Enemy.prototype.setup;

//Load actor metadata notetags.
Game_Actor.prototype.setup = function (actorId) {
    Game_Actor_setup.call(this, actorId);
    this.t_maxHP = parseInt($dataActors[actorId].meta.MaxHP) || null;
    this.t_maxMP = parseInt($dataActors[actorId].meta.MaxMP) || null;
    this.t_maxTP = parseInt($dataActors[actorId].meta.MaxTP) || null;
    this.t_maxATK = parseInt($dataActors[actorId].meta.MaxATK) || null;
    this.t_maxDEF = parseInt($dataActors[actorId].meta.MaxDEF) || null;
    this.t_maxMATK = parseInt($dataActors[actorId].meta.MaxMATK) || null;
    this.t_maxMDEF = parseInt($dataActors[actorId].meta.MaxMDEF) || null;
    this.t_maxAGL = parseInt($dataActors[actorId].meta.MaxAGL) || null;
    this.t_maxLUCK = parseInt($dataActors[actorId].meta.MaxLUCK) || null;
    this.refresh();
 };

 //Load enemy metadata notetags.
 Game_Enemy.prototype.setup = function(enemyId, x, y) {
     Game_Enemy_setup.call(this, enemyId, x, y)
     this.t_maxHP = parseInt($dataEnemies[enemyId].meta.MaxHP) || null;
     this.t_maxMP = parseInt($dataEnemies[enemyId].meta.MaxMP) || null;
     this.t_maxTP = parseInt($dataEnemies[enemyId].meta.MaxTP) || null;
     this.t_maxATK = parseInt($dataEnemies[enemyId].meta.MaxATK) || null;
     this.t_maxDEF = parseInt($dataEnemies[enemyId].meta.MaxDEF) || null;
     this.t_maxMATK = parseInt($dataEnemies[enemyId].meta.MaxMATK) || null;
     this.t_maxMDEF = parseInt($dataEnemies[enemyId].meta.MaxMDEF) || null;
     this.t_maxAGL = parseInt($dataEnemies[enemyId].meta.MaxAGL) || null;
     this.t_maxLUCK = parseInt($dataEnemies[enemyId].meta.MaxLUCK) || null;
     this.refresh();
 };

Drak.getPercent = function(value) {
    return value * .01
};

Game_BattlerBase.prototype.isMaxBuffAffected = function(paramId) {
    return this._buffs[paramId] === Drak.Param.MaxBuff;
};

Game_BattlerBase.prototype.isMaxDeBuffAffected = function(paramId) {
    return this._buffs[paramId] === Drak.Param.MinBuff;
};

Game_BattlerBase.prototype.maxTp = function() {
    if (this.t_maxTP) {
        return this.t_maxTP;
    } else {
        return Drak.Param.MaxTP;
    }
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
        case 'Percentage':
            this.setTp(Math.trunc(Drak.getPercent(Drak.Param.TPVal) * this.maxTp()));
            break;
        case 'Fixed Variable':
            this.setTp(Math.trunc(Number($gameVariables.value(Drak.Param.TPVal))));
            break;
        case 'Random Variable':
            this.setTp(Math.randomInt(Math.trunc(Number($gameVariables.value(Drak.Param.TPVal)))));
            break;
        case 'Percentage Variable':
            this.setTp(Math.trunc(Drak.getPercent(Number($gameVariables.value(Drak.Param.TPVal)))) * this.maxTp());
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

Drak.LB.getRevHp = function() {
    switch (Drak.Param.RevType) {
        case "Fixed":
            return Drak.Param.RevNum;
            break;
        case "Random":
            return Math.randomInt(Drak.Param.RevNum);
            break;
        case "Percentage":
            return Math.trunc(Drak.getPercent(Drak.Param.RevNum) * this.maxHp());
            break;
        case "Fixed Variable":
            return Math.trunc($gameVariables.value(Drak.Param.RevNum));
            break;
        case "Random Variable":
            return Math.randomInt(Math.trunc(Number($gameVariables.value(Drak.Param.RevNum))));
            break;
        case "Percentage Variable":
            return Math.trunc(Drak.getPercent(Number($gameVariables.value(Drak.Param.RevNum)))) * this.maxHp();
            break;
    };

    Game_Party.prototype.reviveBattleMembers = function() {
        for (const actor of this.battleMembers()) {
            if (actor.isDead()) {
                actor.setHp(Drak.LB.getRevHp());
            }
        }
    };
        
};

Game_BattlerBase.prototype.revive = function() {
    if (this._hp === 0) {
        this._hp = Drak.LB.getRevHp();
    }
};

Game_BattlerBase.prototype.paramBuffRate = function(paramId) {
    return this._buffs[paramId] * Drak.getPercent(Drak.Param.BuffRate) + 1.0;
};

Game_Actor.prototype.benchMembersExpRate = function() {
    return $dataSystem.optExtraExp ? Drak.Param.BenchXP : 0;
};

Game_Screen.prototype.maxPictures = function() {
    return Drak.Param.MaxPic;
};

Game_BattlerBase.prototype.attackSkillId = function() {
    const set = this.traitsSet(Game_BattlerBase.TRAIT_ATTACK_SKILL);
    return set.length > 0 ? Math.max(...set) : Drak.Param.AtkID;
};

Game_BattlerBase.prototype.guardSkillId = function() {
    return Drak.Param.GrdID;
};

Game_BattlerBase.prototype.deathStateId = function() {
    return Drak.Param.KoID;
};

Game_Action.prototype.applyCritical = function(damage) {
    return Math.round(damage * Drak.Param.Crit);
};

Game_BattlerBase.prototype.paramMax = function(paramId) {
    switch (paramId) {
        case 0: // MHP
            if (this.t_maxHP && this.t_maxHP > 0) {
                return this.t_maxHP;
            } else if (Drak.Param.MaxHP > 0) {
                return Drak.Param.MaxHP;
            } else {
             return Infinity;
            };

        case 1: // MMP
            if (this.t_maxMP && this.t_maxMP > 0) {
                return this.t_maxMP;
            } else if (Drak.Param.MaxMP > 0) {
                return Drak.Param.MaxMP;
            } else {
             return Infinity;
            };

        case 2: // ATK
            if (this.t_maxATK && this.t_maxATK > 0) {
                return this.t_maxATK;
            } else if (Drak.Param.MaxATK > 0) {
                return Drak.Param.MaxATK;
            } else {
             return Infinity;
            };

        case 3: // DEF
            if (this.t_maxDEF && this.t_maxDEF > 0) {
                return this.t_maxDEF;
            } else if (Drak.Param.MaxDEF > 0) {
                return Drak.Param.MaxDEF;
            } else {
             return Infinity;
            };

        case 4: // MATK
            if (this.t_maxMATK && this.t_maxMATK > 0) {
                return this.t_maxMATK;
            } else if (Drak.Param.MaxMATK > 0) {
                return Drak.Param.MaxMATK;
            } else {
             return Infinity;
            };

        case 5: // MDEF
            if (this.t_maxMDEF && this.t_maxMDEF > 0) {
                return this.t_maxMDEF;
            } else if (Drak.Param.MaxMDEF > 0) {
                return Drak.Param.MaxMDEF;
            } else {
             return Infinity;
            };

        case 6: // AGL
            if (this.t_maxAGL && this.t_maxAGL > 0) {
                return this.t_maxAGL;
            } else if (Drak.Param.MaxAGL > 0) {
                return Drak.Param.MaxAGL;
            } else {
             return Infinity;
            };

        case 7: // LUCK
            if (this.t_maxLUCK && this.t_maxLUCK > 0) {
                return this.t_maxLUCK;
            } else if (Drak.Param.MaxLUCK > 0) {
                return Drak.Param.MaxLUCK;
            } else {
             return Infinity;
            };

        default:
            return Infinity;
    };
    

};