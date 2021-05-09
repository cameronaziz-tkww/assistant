"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var scss_parser_1 = require("scss-parser");
var vscode = __importStar(require("vscode"));
var atrules_1 = require("@tkww-assistant/atrules");
var utils_2 = require("../utils");
var createCommand = function () {
    // Create `convertValue` command.
    var command = vscode
        .commands
        .registerCommand('tkww.removeVariables', function (unusedVariables) {
        var _a = vscode.window, activeTextEditor = _a.activeTextEditor, showInformationMessage = _a.showInformationMessage;
        // If no text editor is open, exit.
        if (!activeTextEditor) {
            // This should never happen.
            return;
        }
        var newAtRule = unusedVariables
            .remove()
            .parents('atrule');
        var spacesRemoved = atrules_1.utils
            .getDirtyVariables(newAtRule)
            .filter(function (_a) {
            var node = _a.node;
            return node.type === 'space' || node.type === 'punctuation';
        })
            .remove()
            .parents('atrule');
        var cleanedVars = atrules_1.utils
            .getDirtyVariables(spacesRemoved, true)
            .before(utils_1.constants.nodes.space)
            .after(utils_1.constants.nodes.comma)
            .last()
            .next()
            .replace(function () { return utils_1.constants.nodes.space; })
            .parents('atrule');
        var vars = atrules_1.utils
            .getDirtyVariables(cleanedVars, true);
        if (vars.length() === 0) {
            var isLast = newAtRule
                .next()
                .get(0)
                .type === 'space';
            if (isLast) {
                newAtRule
                    .next()
                    .remove();
            }
            newAtRule.remove();
        }
        var modified = newAtRule
            .parents('stylesheet')
            .get(0);
        var css = scss_parser_1.stringify(modified);
        // Write the text in the file.
        utils_2.updateText(css, activeTextEditor);
        // Move the cursor to the top left of the editor.
        utils_2.moveCursor(activeTextEditor);
        // Log to output channel.
        showInformationMessage('This file was modified.');
    });
    return command;
};
exports.default = createCommand;
//# sourceMappingURL=removeVariables.js.map