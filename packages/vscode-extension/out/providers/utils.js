"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gutterIconPath = exports.getDependencyVariables = exports.settings = exports.getCodeLenses = void 0;
var utils_1 = require("@tkww-assistant/utils");
var path_1 = require("path");
var vscode_1 = require("vscode");
var getCodeLenses = function (codeLenses) {
    return codeLenses.map(function (codeLens) { return codeLens.codeLens; });
};
exports.getCodeLenses = getCodeLenses;
var settings = function () {
    return vscode_1.workspace
        .getConfiguration(utils_1.constants.configurationSection)
        .get('codeLens');
};
exports.settings = settings;
var getDependencyVariables = function (dependency) {
    if (!dependency) {
        return [];
    }
    var dependencyValues = dependency
        .wrapper
        .find('rule')
        .find('value');
    var identifiers = [];
    for (var j = 0; j < dependencyValues.length(); j += 1) {
        var dependencyValue = dependencyValues.eq(j);
        identifiers.push(dependencyValue.value().trim());
    }
    return identifiers;
};
exports.getDependencyVariables = getDependencyVariables;
var gutterIconPath = function (context) { return vscode_1.Uri.file(path_1.join(context.extensionPath, 'images', 'union-128.png')); };
exports.gutterIconPath = gutterIconPath;
//# sourceMappingURL=utils.js.map