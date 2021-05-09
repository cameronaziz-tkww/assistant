"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_1 = require("vscode");
var moveCursor = function (textEditor) {
    var position = textEditor.selection.active;
    var newPosition = position.with(0, 0);
    var newSelection = new vscode_1.Selection(newPosition, newPosition);
    textEditor.selection = newSelection;
};
exports.default = moveCursor;
//# sourceMappingURL=moveCursor.js.map