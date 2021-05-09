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
var vscode = __importStar(require("vscode"));
var convert_1 = require("@tkww-assistant/convert");
var scss_parser_1 = require("scss-parser");
var utils_1 = require("../utils");
var createCommand = function () {
    // Create `convertValue` command.
    var command = vscode
        .commands
        .registerCommand('tkww.convertValue', function (match) {
        var _a = vscode.window, activeTextEditor = _a.activeTextEditor, showInformationMessage = _a.showInformationMessage;
        // If no text editor is open, exit.
        if (!activeTextEditor) {
            // This should never happen.
            return;
        }
        convert_1.value(match);
        var modified = match.source.parents('stylesheet').get(0);
        var css = scss_parser_1.stringify(modified);
        // Write the text in the file.
        utils_1.updateText(css, activeTextEditor);
        // Move the cursor to the top left of the editor.
        utils_1.moveCursor(activeTextEditor);
        // Log to output channel.
        showInformationMessage('This file was modified.');
    });
    return command;
};
exports.default = createCommand;
//# sourceMappingURL=convertValue.js.map