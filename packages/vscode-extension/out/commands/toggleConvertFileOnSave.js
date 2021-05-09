"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var vscode_1 = require("vscode");
var createCommand = function () {
    var command = vscode_1.commands.registerCommand('tkww.toggleConvertFileOnSave', function () {
        // Get configuration for TKWW
        var config = vscode_1.workspace.getConfiguration(utils_1.constants.configurationSection);
        // Get `convertFileOnSave` setting.
        var originalValue = config.get('convertFileOnSave');
        // Update the setting.
        config.update('convertFileOnSave', !originalValue);
        // Log to output channel
        vscode_1.window.showInformationMessage("Files will " + (!originalValue ? '' : 'not') + " be modified on save.");
    });
    return command;
};
exports.default = createCommand;
//# sourceMappingURL=toggleConvertFileOnSave.js.map