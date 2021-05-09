"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var scss_parser_1 = require("scss-parser");
var query_ast_1 = __importDefault(require("query-ast"));
var vscode_1 = require("vscode");
var hover = function (initializer) {
    var settings = function () { return vscode_1.workspace
        .getConfiguration(utils_1.constants.configurationSection)
        .get('hover'); };
    var provider = vscode_1.languages.registerHoverProvider(utils_1.constants.supportedLanguageExt, {
        provideHover: function (document, position) {
            if (settings()) {
                var text = document
                    .getText()
                    .split('\n')[position.line];
                var property = query_ast_1.default(scss_parser_1.parse(text))()
                    .find('declaration')
                    .find('value')
                    .find('identifier');
                if (property.length() > 0) {
                    var variable_1 = property.value();
                    var found = initializer.dependecyASTQ
                        .find('rule')
                        .find('value')
                        .find('identifier')
                        .filter(function (_a) {
                        var node = _a.node;
                        return node.value === variable_1.trim();
                    })
                        .parents('rule')
                        .find('from');
                    var text_1 = '';
                    if (found.length() > 0) {
                        for (var i = 0; i < found.length(); i += 1) {
                            var node = found.eq(i);
                            var value = node
                                .value()
                                .trim();
                            text_1 = "" + text_1 + (node.has('color_hex').length() > 0 ? '#' : '');
                            text_1 = "" + text_1 + value;
                            text_1 = "" + text_1 + (i === found.length() - 2 ? ' or ' : ', ');
                        }
                        text_1 = text_1.substring(0, text_1.length - 2);
                        return {
                            contents: ["This is the Union variable for " + text_1 + "."]
                        };
                    }
                }
            }
        }
    });
    return provider;
};
exports.default = hover;
//# sourceMappingURL=hover.js.map