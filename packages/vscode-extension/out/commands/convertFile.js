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
var convert_1 = require("@tkww-assistant/convert");
var utils_1 = require("@tkww-assistant/utils");
var vscode = __importStar(require("vscode"));
var utils_2 = require("../utils");
var createCommand = function (initializer) {
    // Create `convertFile` command.
    var command = vscode.commands.registerCommand('tkww.convertFile', function () {
        var _a = vscode.window, activeTextEditor = _a.activeTextEditor, showInformationMessage = _a.showInformationMessage;
        // If no text editor is open, exit.
        if (!activeTextEditor) {
            return;
        }
        var _b = activeTextEditor.document, languageId = _b.languageId, getText = _b.getText, fileName = _b.fileName;
        // If the file extension is wrong, exit.
        if (!utils_1.constants.supportedLanguageExt.includes(languageId)) {
            return;
        }
        // Get text of file and convert to array.
        var text = getText();
        var dependencies = initializer.dependecyASTQ;
        // Convert text.
        var modifiedCSS = convert_1.file(text, dependencies);
        if (modifiedCSS !== text) {
            // Write the text in the file.
            utils_2.updateText(modifiedCSS, activeTextEditor);
            // Log to output channel.
            showInformationMessage('This file was modified.');
        }
    });
    return command;
};
exports.default = createCommand;
//# sourceMappingURL=convertFile.js.map