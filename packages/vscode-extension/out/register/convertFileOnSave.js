"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var vscode_1 = require("vscode");
var convertFileOnSave = function () {
    var onSave = function () {
        // Get configuration for TKWW
        var config = vscode_1.workspace.getConfiguration(utils_1.constants.configurationSection);
        // Get `convertFileOnSave` setting.
        var onSave = config.get('convertFileOnSave');
        // If convertFileOnSave = true, convertFile file.
        if (onSave) {
            vscode_1.commands.executeCommand('tkww.convertFile');
        }
    };
    vscode_1.workspace.onWillSaveTextDocument(onSave);
};
exports.default = convertFileOnSave;
//# sourceMappingURL=convertFileOnSave.js.map