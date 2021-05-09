"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var child_process_1 = require("child_process");
var vscode_1 = require("vscode");
var openURL = function (url) {
    var opener;
    switch (process.platform) {
        case 'darwin':
            opener = 'open';
            break;
        case 'win32':
            opener = 'start';
            break;
        default:
            opener = 'xdg-open';
            break;
    }
    return child_process_1.exec(opener + " \"" + url.replace(/"/g, '\\\"') + "\"");
};
var showError = function (message, options) {
    var items = ['close'];
    if (options === null || options === void 0 ? void 0 : options.allowReportToSlack) {
        items.unshift('Report Issue');
    }
    vscode_1.window
        .showErrorMessage.apply(vscode_1.window, __spreadArrays([message], items)).then(function (item) {
        if (item === 'Report Issue') {
            openURL(utils_1.constants.slackURL);
        }
    });
    if (options === null || options === void 0 ? void 0 : options.outputChannel) {
        options.outputChannel.append(message);
    }
};
var reportError = function (message, outputChannel) {
    var options = {
        outputChannel: outputChannel,
        allowReportToSlack: true,
    };
    showError(message, options);
};
exports.default = {
    showError: showError,
    reportError: reportError,
};
//# sourceMappingURL=errors.js.map