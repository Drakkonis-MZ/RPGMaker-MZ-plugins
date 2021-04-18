/*:
@target MZ
@author Drakkonis
@plugindesc This plugin contains core functions often used in my other plugins.

@help
This plugin was developed to aid plugin creation, as I found myself having to
rewrite the same general functions in nearly each plugin I made. So I stuck
them all in here. As such, my more "robust" plugins will all require this
plugin. Coincidentally, it can be used as a standalone tool to aid in the
creation of your own plugins.

There are currently 3 primary functions for this core plugin.

Function 1 - Color Conversion
Calling ColorManager.getColor(color) is used to accomodate having a single
parameter for a color setting and not needing to restrict it to system or
hex colors. Pass either to this function, and the output is hex.

Function 2 - Getting Notetag Block Data
DataManager.assignNoteBlockData takes a $data object, such as $dataActors,
and as many notetag keywords as you like, and runs through each object
in the data, pulling every line between <note key> and </note key> lines,
and sticking that data on the object in question for easy data access.
The data is stored as an array directly on the $data object, with the
name equal to the keyword. If there are spaces in that keyword, you'll
need to either rename/manually reassign the array later, or simply use
$dataObject["note key"] format to access the data.

Function 3 - Plugin Parameter Conversion
One of the first things a plugin with parameters does is pull all the
parameters from PluginManager, and usually convert them for easy use.
PluginManager.convertParams(pluginName) will automatically convert all
parameters associated with that plugin, including automatically parsing
any JSON-escaped objects and strings. It returns the entire collection
as a single object, so instead of assigning a variable to
PluginManager.parameters(pluginName), assign it to
PluginManager.convertParams(pluginName) instead.

A note for function 3: It automatically assumes what the data is supposed
to be, since parameter values are all initially strings. This means that,
for example, if you want a value with a number to be a string type instead
of a number type, this function will actually provide extra work by requiring
you to manually convert it back to a string. The assumptions are made by
the content of the string, with no way to specify any exceptions. Also,
any blank values are set to null. If you don't want that to happen at all,
feel free to delete the line in question (line 85).
*/

var Imported = Imported || {};
Imported.DrakCore = true;

//allows a color setting to be system or hex without needing separate variables, parameters, or code
ColorManager.getColor = function(color) {
    if (color.match(/^#[0-9A-F]{6}$/i)) return color;
    var c = parseInt(color);
    if (c >= 0 && c <= 31) return ColorManager.textColor(c);
    throw new Error("Invalid color code. (" + color + ")");
};

//assigns data arrays to $data objects from notetag blocks
//the data array will have the same name as the notetag block
DataManager.assignNoteBlockData = function(data, ...args) {
    var flag = false; var key = []
    args.forEach(a => key.push(a));
    for (i = 1; i < data.length; i++) {
        key.forEach(k => data[i][k] = [])
        var notes = data[i].note.split(/[\r\n]+/);
        notes.forEach(n =>{
            key.forEach(k =>{
                if (n.match(new RegExp("<(?:" + k + ")>", "i"))) flag = true; //start of block
                else if (n.match(new RegExp("<\/(?:" + k + ")>", "i"))) flag = false; //end of block
                else if (flag) data[i][k].push(n); //data in block
            })
        })
    }
};

//returns an object containing a plugin's parameters converted to their proper types
PluginManager.convertParams = function(plugin) {
    return DataManager.parseObject(PluginManager.parameters(plugin));
};

DataManager.convertParam = function(param) {
    if (param == "") return null; //is empty
    if (!isNaN(param)) return Number(param); //is a number
    if (param == "true" || param == "false") return param === "true"; //is boolean
    if (Array.isArray(param)) return DataManager.parseArray(param); //is an array
    if (typeof param == 'object') return DataManager.parseObject(param); //is an object
    if (param.charAt(0) == "[" || param.charAt(0) == "{" || param.charAt(0) == '"') return DataManager.parseJSON(param); //is a JSON object
    return param; //is a string and thus needs no conversion
};

DataManager.parseArray = function(ar) {
    var n = []
    ar.forEach(a => n.push(DataManager.convertParam(a)));
    return n;
};

DataManager.parseJSON = function(json) {
    return  DataManager.convertParam(JSON.parse(json));
};

DataManager.parseObject = function(obj) {
    for (key of Object.keys(obj)) {obj[key] = DataManager.convertParam(obj[key])};
    return obj;
};