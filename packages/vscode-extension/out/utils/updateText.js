"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_1 = require("vscode");
var updateText = function (text, activeTextEditor) {
    var firstLine = activeTextEditor.document.lineAt(0);
    var lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
    var textRange = new vscode_1.Range(0, firstLine.range.start.character, activeTextEditor.document.lineCount - 1, lastLine.range.end.character);
    activeTextEditor.edit(function (editBuilder) {
        editBuilder.replace(textRange, text);
    });
};
exports.default = updateText;
//# sourceMappingURL=updateText.js.map