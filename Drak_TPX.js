/*:
@plugindesc Turns the TP bar into an EXP bar. Only use if you're not going to use the TP system at all.
@author Drakkonis

@param dispMode
@type select
@option Current EXP
@option Percentage
@text TP Guage Display
@desc Do you want the guage to display the EXP amount, or a percentage towards the next level?
@default Current EXP
*/

var Imported = Imported || {};
Imported.Drak_TPX = true;
var TPX = TPX || {};
TPX.Parameters = PluginManager.parameters('Drak_TPX');
TPX.mode = TPX.Parameters['dispMode'];

const battler_refresh = Game_BattlerBase.prototype.refresh; //alias the original function, so we can call the original version

Game_BattlerBase.prototype.refresh = function() {
    battler_refresh.call(this); //call the aliased (original) version of this function, since we're adding to it, not replacing it
    if (this.isActor()) {
        if (TPX.mode == "Current EXP") {
            this._tp = this.currentExp();
        } else if (TPX.mode == "Percentage") {
            this._tp = Math.round((this.currentExp() / this.nextLevelExp()) * 100);
        };
    };
};

Game_Actor.prototype.maxTp = function() {
    if (TPX.mode == "Current EXP") {
        return this.nextLevelExp();
    } else return 100;
    
};

Game_BattlerBase.prototype.isPreserveTp = function() { //allows you to see the right amount of xp outside of battle
    return true;
};