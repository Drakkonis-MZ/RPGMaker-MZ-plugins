/*:
@target MZ
@author Drakkonis
@plugindesc This plugin allows you to customize the TP system for each battler, to allow different 2nd resource mechanics with customizable control.

@param styles
@text Styles
@type struct<tp>[]

@help
This plugin allows you to customize the built-in TP system into pre-defined
resource styles, and then assign those styles to actors, classes, and enemies.
This allows you to easily have multiple different combat styles without
having to event or script any differences from the default standard for each
battler with a non-standard system.

For each style, there are a number of parameters you can set, and any that
are left blank will behave as they otherwise would. This means you only have
to set what actually will be different from the normal setup. To actually
add a style to a battler or class, simply write "<Style:X>" in the object's
notebox, where X is the name you define in the style's parameters.

These parameters broadly fall into two groups: aesthetics, and functions.
Aesthetic parameters have little effect other than determining how a style
looks. This includes things such as the name, the color for the gauges, and
so on. All color parameters equally accept either a system color (0-31) or
a hex code for any color. This plugin will automatically detect which type
you've entered. It will also throw an error message at runtime if you
make a mistake or set something other than a system or hex color. It will
tell you exactly what the invalid color parameter is, so you should be
able to quickly find and correct it.

There are two non-function parameters that aren't aesthetics, and they
manage initial and resetting TP values. The first determines if a style's
user is setup with full TP or 0 TP. The second determines what happens to
the TP value at the end of a battle. If it is set to "Don't Reset", they'll
keep the amount of TP they had at the end of the battle. If set to "Reset",
the TP value will either be set to full or empty, depending on the setting
for the first parameter. So if an actor's style is set to start full, and
reset after battle, they'll have full TP after every battle.

The function parameters allow you to write custom code for certain points in
the battle flow, so this is where the bulk of customization will be done. For
all but one, the functions will be self-contained. The only exceptions are
the function for max TP, which will determine your max style resource
capacity, and the function for TP regeneration. The max TP function uses a
variable named "max" for the final number, so your code will have to set a
value to this variable, or your max will be 0. Same for the regeneration
function, but use the variable "value" instead. The final number set to
"value" will be multiplied by the battler's TP regeneration rate to get the
final value that will actually be applied. By default, no battler has TP
regeneration at all, so you'd need to add it to the battlers using styles
that have a regeneration function.

Most of these functions will reference the battler the style is assigned to.
This means you can use "this" to refer to the user of the style, and any
methods and variables therein. The only difference is the function for when
a new turn starts, since that function is contained in the Game_Troop class.

This plugin is highly dependent on your own scripting skills, since all
functions use user-written code. Therefore most issues will likely lay with
the custom scripts or not knowing the "order of operations." The order of
operations only affects a handful of things, the biggest being the functions
triggering off of changes to the TP value. I'll cover the operations affected
below.

First thing to know, is that TP regeneration or a full TP reset at the end of
a battle do NOT trigger any of the TP change functions. This is intended to
avoid triggering the gain functions with "passive" changes.

When a battler's TP is changed, any gain/loss code is ran, followed by the
change code. The change code is ran regardless of if there was a gain or loss
code that was evaluated, so keep that in mind when writing your code.

The next part that contains an order of operations is the code ran at the
end of a battle. Normally, all battle-limited states are removed, as well
as all buffs/debuffs, and then TP preservation is checked. A style's code
for the end of a battle runs just BEFORE all of that. This means the exact
state of the game when the battle ends is at hand for your code to interact
with. Keep in mind that each battler's style end code is ran in sequential
order, so be careful if you're interacting with something on a battler
NOT currently referred to, as two individuals with the same style could get
different results if modifying something on a battler other than themselves.

After the end code is ran, and all buffs and battle states are removed, the
game checks the battler to see if TP is to be preserved outside of battle.
Normally it checks for a certain flag to be set via traits, but the reset
parameter for a user's style overrides this, making that flag useless on
any battler with a TP style set. There are three potential outcomes at this
point if a battler has a TP style. If the reset parameter is set to false,
TP is preserved, allowing the current value to persist outside of battle.
If it is set to true, the outcome depends on the parameter setting whether
the battler starts with full TP or not. If it starts with full TP, then
it will reset to full TP. Otherwise, TP is reset to 0.

One thing to keep in mind is that a skill or state's interaction with TP
doesn't notice or care about TP styles. Keep this in mind when dealing
with skills or states that cost or gain TP as defined in the database,
especially if different styles have completely unrelated mechanics.

Version History:
v1.10 - updated to use Drak_Core
v1.01 - bugfix
v1.00 - initial release
*/

/*~struct~tp:
@param name
@text TP Style Name
@desc The name of this TP style, which will be referred to in battler notetags, and anywhere else the full TP name is mentioned.
@default Untitled

@param shortName
@text Abbreviated Name
@desc The short name of this style, which will appear on the guage.
@default TP

@param nameColor
@text Style Gauge Label Color
@desc The color the style's name will be drawn in on the gauge.

@param valNorm
@text Normal Value Color
@desc The normal color the value numbers will be drawn in.

@param valFull
@text Full Value Color
@desc The color the value numbers will be drawn in when the value is at max. Leave blank to use the normal color.

@param valEmpty
@text Empty Value Color
@desc The color the value numbers will be drawn in when the value is at 0. Leave blank to use the normal color.

@param valLow
@text Low Value Color
@desc The color the value numbers will be drawn in when the value is below the defined threshold.

@param lowNum
@text Low Value Threshold %
@desc The point where the current TP value is considered "low". Only affects Low Value Color.

@param color1
@text Gauge Color 1
@desc This is the color the left side of the gauge is drawn in. 0 - 31 will use system colors, and hex values may be used.

@param color2
@text Gauge Color 2
@desc This is the color the right side of the gauge is drawn in. 0 - 31 will use system colors, and hex values may be used.

@param startFull
@text Start With Full TP?
@desc Does this battler start off with full TP? For actors, this only applies to their setup(new game, join party, etc.).
@type boolean
@on Start Full
@off Start Empty
@default false

@param reset
@text Reset Every Battle?
@desc Does this style reset TP to its initial value after every battle? Only applicable to actors.
@type boolean
@on Reset
@off Don't Reset
@default true

@param max
@text Max TP
@desc This code will determine this style's max TP. Leave blank to leave unchanged, otherwise set a value for "max".
@type note

@param charge
@text Charge Behavior
@desc This code will determine behavior when the battler is dealt damage, when TP is normally charged.
@type note

@param gain
@text When TP Gained
@desc This code will run when TP is gained. It will only run if the battler's TP value actually increases.
@type note

@param loss
@text When TP Lost
@desc This code will run when TP is lost. It will only run if the battler's TP value actually decreases.
@type note

@param change
@text When TP Changed
@desc This code will run when the TP amount is changed, whether gained or lost.
@type note

@param onMax
@text When Max TP Reached
@desc This code will run when a battler reaches their max TP.
@type note

@param onEmpty
@text When 0 TP Reached
@desc This code will run when a battler reaches 0 TP.
@type note

@param turn
@text When Turn Starts
@desc This code will run when a new turn starts. The timing depends on your battle system.
@type note

@param regen
@text When TP Regenerates
@desc This code will run any time TP regeneration occurs. Set a value for the variable "value".
@type note

@param end
@text When Battle Ends
@desc This code will run when the battle ends.
@type note
*/
var Drak = Drak || {};
Drak.TPC = PluginManager.convertParams('Drak_TP_Control');
Drak.TPC.version = 1.10;

//aliases
const gauge_label = Sprite_Gauge.prototype.label;
const label_color = Sprite_Gauge.prototype.labelColor;
const value_color = Sprite_Gauge.prototype.valueColor;
const tp_gauge_color1 = Sprite_Gauge.prototype.gaugeColor1;
const tp_gauge_color2 = Sprite_Gauge.prototype.gaugeColor2;
const maxTP = Game_BattlerBase.prototype.maxTp;
const setTP = Game_BattlerBase.prototype.setTp;
const newTurn = Game_Troop.prototype.increaseTurn;
const endBattle = Game_Battler.prototype.onBattleEnd;
const actorSetup = Game_Actor.prototype.setup;
const enemySetup = Game_Enemy.prototype.setup;

//Custom functions

Drak.TPC.getStyle = function (battler) {
    if (battler.isActor()) {
        if (battler.currentClass().meta.Style) return Drak.TPC.styles.find(s => s.name == battler.currentClass().meta.Style);
        if (battler.actor().meta.Style) return Drak.TPC.styles.find(s => s.name == battler.actor().meta.Style);
    } else return Drak.TPC.styles.find(s => s.name == battler.enemy().meta.Style) || null;
};

Drak.TPC.checkTpChange = function(battler, tp) {
    if (tp == battler.tp) return "none";
    if (tp > battler.maxTp() && battler.tp == battler.maxTp()) return "none";
    if (tp < 0 && battler.tp == 0) return "none";
    if (tp > battler.tp) return "gain";
    if (tp < battler.tp) return "loss";
    return "none";
};

//Skill Window functions

Window_SkillList.prototype.drawItem = function(index) {
    const skill = this.itemAt(index);
    if (skill) {
        const costWidth = this.costWidth();
        const rect = this.itemLineRect(index);
        this.changePaintOpacity(this.isEnabled(skill));
        var cw = costWidth;
        if (this._actor.skillTpCost(skill) > 0 && this._actor.skillMpCost(skill) > 0) cw *= 2;
        this.drawItemName(skill, rect.x, rect.y, rect.width - cw);
        this.drawSkillCost(skill, rect.x, rect.y, rect.width);
        this.changePaintOpacity(1);
    }
};

Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor.skillTpCost(skill) > 0) {
        var s = Drak.TPC.getStyle(this._actor);
        s && s.nameColor ? this.changeTextColor(ColorManager.getColor(s.nameColor)) : this.changeTextColor(ColorManager.tpCostColor());
        var l = "";
        s && s.shortName ? l = s.shortName : l = "TP"
        this.drawText(this._actor.skillTpCost(skill) + l, x, y, width, "right");
    };

    if (this._actor.skillMpCost(skill) > 0) {
        this.changeTextColor(ColorManager.mpCostColor());
        if (this._actor.skillTpCost(skill) > 0) x -= this.costWidth();
        this.drawText(this._actor.skillMpCost(skill) + "MP", x, y, width, "right");
    };
};

Window_SkillList.prototype.costWidth = function() {
    return this.textWidth("000MP");
};

//Sprite Gauge functions

Sprite_Gauge.prototype.label = function() {
    if (this._statusType == 'tp') {
        var s = Drak.TPC.getStyle(this._battler);
        if (s && s.shortName) return s.shortName;
    };
    return gauge_label.call(this);
};

Sprite_Gauge.prototype.labelColor = function() {
    if (this._statusType == 'tp') {
        var s = Drak.TPC.getStyle(this._battler)
        if (s && s.nameColor) return ColorManager.getColor(s.nameColor);
    }
    return label_color.call(this);
};

Sprite_Gauge.prototype.valueColor = function() {
    if (this._statusType == 'tp') {
        var s = Drak.TPC.getStyle(this._battler);
        if (s) {
            switch (this.currentValue()) {
                case this.currentMaxValue():
                    if (s.valFull) return ColorManager.getColor(s.valFull);
                case 0:
                    if (s.valEmpty) return ColorManager.getColor(s.valEmpty);
                default:
                    if (s.lowNum && this.currentValue() <= (s.lowNum * .01) * this.currentMaxValue() && s.valLow) return ColorManager.getColor(s.valLow);
            };
            if (s.valNorm) return ColorManager.getColor(s.valNorm);
        };
    };
    return value_color.call(this);
};

Sprite_Gauge.prototype.gaugeColor1 = function() {
    if (this._statusType == 'tp') {
        var s = Drak.TPC.getStyle(this._battler);
        if (s && s.color1) return ColorManager.getColor(s.color1);
    };
    return tp_gauge_color1.call(this);
};

Sprite_Gauge.prototype.gaugeColor2 = function() {
    if (this._statusType == 'tp') {
        var s = Drak.TPC.getStyle(this._battler);
        if (s && s.color2) return ColorManager.getColor(s.color2);
    };
    return tp_gauge_color2.call(this);
};

//Battler functions
Game_Enemy.prototype.setup = function(enemyId, x, y) {
    enemySetup.call(this, enemyId, x, y);
    var s = Drak.TPC.getStyle(this);
    if (s && s.startFull == true) this._tp = this.maxTp();
};

Game_Actor.prototype.setup = function(actorId) {
    actorSetup.call(this, actorId);
    var s = Drak.TPC.getStyle(this);
    if (s && s.startFull == true) this._tp = this.maxTp();
}

Game_BattlerBase.prototype.maxTp = function() {
    var s = Drak.TPC.getStyle(this);
    if (s && s.max) {
        var max = 0;
        try {
            eval(s.max);
            return max;
        } catch (e) {throw new Error("Invalid Max TP function for TP Style " + s.name + ".")};
    };
    return maxTP.call(this);
};

Game_BattlerBase.prototype.setTp = function(tp) {
    var s = Drak.TPC.getStyle(this);
    if (s) {
        c = Drak.TPC.checkTpChange(this, tp)
        if (c !== "none") {
            switch (c) {
                case "gain":
                    if (s.gain) {
                        try {eval(s.gain)}
                        catch (e) {throw new Error("Invalid TP gain function for TP Style " + s.name + ".")};
                    };

                    if (s.onMax && this.tp + tp >= this.maxTp()) {
                        try {eval(s.onMax)}
                        catch (e) {throw new Error("Invalid on max TP function for TP Style " + s.name + ".")};
                    };
                case "loss":
                    if (s.loss) {
                        try {eval(s.loss)}
                        catch (e) {throw new Error("Invalid TP loss function for TP Style " + s.name + ".")};
                    };

                    if (s.onEmpty && this.tp - tp <=0) {
                        try {eval(s.onEmpty)}
                        catch (e) {throw new Error("Invalid on empty TP function for TP Style " + s.name + ".")};
                    }
            };
            if (s.change) {
                try {
                    eval(s.change)
                } catch (e) {throw new Error("Invalid TP change function for TP Style " + s.name + ".")};
            }
        }
    }
    setTP.call(this, tp);
};

Game_Actor.prototype.isPreserveTp = function() {
    s = Drak.TPC.getStyle(this);
    if (s) {
        if (s.reset == true && s.startFull == true) {
            setTP.call(this, this.maxTp());
            return true;
        };
        return !s.reset;
    }
    return Game_BattlerBase.prototype.isPreserveTp.call(this);
};

Game_Battler.prototype.regenerateTp = function() {
    var value = 0; s = Drak.TPC.getStyle(this);
    if (s && s.regen) {
        try {eval(s.regen)}
        catch (e) {throw new Error("Invalid regeneration function for TP Style " + s.name + ".")}} 
    else value = this.maxTp();
    value = Math.floor(value * this.trg);
    this.gainSilentTp(value);
};

Game_Battler.prototype.gainSilentTp = function(value) {setTP.call(this, this.tp + value)};

//Battle flow functions

Game_Troop.prototype.increaseTurn = function() {
    newTurn.call(this);
    var b_members = this.aliveMembers().concat($gameParty.aliveMembers());
    b_members.forEach(b => {
        s = Drak.TPC.getStyle(b);
        if (s && s.turn) {
            try {
                eval(s.turn);
            } catch (e) {throw new Error("Invalid new turn function for TP Style " + s.name + ".")};
        };
    });
};

Game_Battler.prototype.onBattleEnd = function() {
    var s = Drak.TPC.getStyle(this);
    if (s && s.end) {
        try {eval(s.end)}
        catch (e) {throw new Error("Invalid end of battle function for TP Style " + s.name + ".")};
    }
    endBattle.call(this);
};