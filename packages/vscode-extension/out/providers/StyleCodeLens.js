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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var atrules_1 = require("@tkww-assistant/atrules");
var dependencies_1 = require("@tkww-assistant/dependencies");
var utils_1 = require("@tkww-assistant/utils");
var convert_1 = require("@tkww-assistant/convert");
var scss_parser_1 = require("scss-parser");
var query_ast_1 = __importDefault(require("query-ast"));
var vscode_1 = require("vscode");
var utils = __importStar(require("./utils"));
var StyleCodeLens = /** @class */ (function () {
    function StyleCodeLens(initializer) {
        var _this = this;
        this.codeLensSettings = utils.settings();
        this.codeLenses = [];
        this._onDidChangeCodeLenses = new vscode_1.EventEmitter();
        this.gutterIcons = [];
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        this.changeType = function (clientQueryWrapper) {
            // Search the client for any values tha match the dependencies.
            var rules = _this.initializer.dependecyASTQ.find('rule');
            var matches = convert_1.matchNodeValue(clientQueryWrapper, rules);
            // `source` is the client value, change is the suggested change.
            matches.forEach(function (_a) {
                var _b;
                var source = _a.source, change = _a.change;
                // There will only be one node in each source, so we can get(0).
                var start = source.get(0).start;
                var changeValue = change.value();
                if (start) {
                    var packageName = atrules_1.getPackageName.forDependency(change);
                    var column = start.column, line = start.line;
                    var startLine = line - 1;
                    _this.addGutterIcon(startLine);
                    if ((_b = _this.codeLensSettings) === null || _b === void 0 ? void 0 : _b.findConverts) {
                        var range = new vscode_1.Range(startLine, column, startLine, column + changeValue.length);
                        var codeLens = new vscode_1.CodeLens(range);
                        codeLens.command = {
                            title: source.value() + " can be converted to " + changeValue + " from the " + packageName + " package. Click to convert.",
                            command: "tkww.convertValue",
                            arguments: [{
                                    source: source,
                                    change: change,
                                }],
                        };
                        _this.codeLenses.push({
                            codeLens: codeLens,
                            startLine: startLine,
                            type: 'convert',
                        });
                    }
                }
            });
        };
        this.findInvalidImports = function (clientWrapper) {
            var atRules = atrules_1.utils.getAtValueRules(clientWrapper);
            var _loop_1 = function (i) {
                var currentAtRule = atRules.eq(i);
                var start = currentAtRule.get(0).start;
                var locations = atrules_1.getPackageName.forAtValue(currentAtRule)[0];
                var dependencyImports = dependencies_1.getImports(_this.initializer.dependecyASTQ.find('rule'));
                var dependency = dependencyImports.find(function (_a) {
                    var dependencyImport = _a.dependencyImport;
                    return dependencyImport === locations;
                });
                if (dependency && start) {
                    var line = start.line, column = start.column;
                    var startLine = line - 1;
                    var identifiers_1 = utils.getDependencyVariables(dependency);
                    var invalidVariables = atrules_1.getVariables(currentAtRule, true)
                        .find(function (_a) {
                        var node = _a.node;
                        return !identifiers_1.includes(node.value.toString().trim());
                    });
                    if (invalidVariables.length() > 0) {
                        var changes = invalidVariables
                            .map(function (_a) {
                            var node = _a.node;
                            return node.value.toString();
                        })
                            .reverse();
                        _this.addGutterIcon(startLine);
                        var changeValue = utils_1.accessors.changeValue(changes);
                        var range = new vscode_1.Range(startLine, column, startLine, column + changeValue.length);
                        var codeLens = new vscode_1.CodeLens(range);
                        var plural = changes.length > 1;
                        codeLens.command = {
                            title: "The variable" + (plural ? 's' : '') + " " + changeValue + " " + (plural ? 'are' : 'is') + " invalid. Click to remove.",
                            command: "tkww.removeVariables",
                            arguments: [invalidVariables],
                        };
                        _this.codeLenses.push({
                            codeLens: codeLens,
                            startLine: startLine,
                            type: 'invalid',
                        });
                    }
                }
            };
            for (var i = 0; i < atRules.length(); i += 1) {
                _loop_1(i);
            }
        };
        this.findUnused = function (clientQueryWrapper) {
            var unusedVariablesArray = atrules_1.extraVariables(clientQueryWrapper)
                .filter(function (unusedVariables) { return unusedVariables.length() > 0; });
            unusedVariablesArray.forEach(function (unusedVariables) {
                var _a;
                var unusedVariablesAt = unusedVariables
                    .first()
                    .parents('atrule');
                var packageName = atrules_1.getPackageName.forAtValue(unusedVariablesAt)[0];
                var dependencyImports = dependencies_1.getImports(_this.initializer.dependecyASTQ.find('rule'));
                var dependency = dependencyImports.find(function (_a) {
                    var dependencyImport = _a.dependencyImport;
                    return dependencyImport === packageName;
                });
                var identifiers = utils.getDependencyVariables(dependency);
                var unusedValidVariables = unusedVariables
                    .find(function (_a) {
                    var node = _a.node;
                    return identifiers.includes(node.value.toString().trim());
                });
                if (dependency && unusedValidVariables.length() > 0) {
                    var start = unusedValidVariables.get(0).start;
                    var changeValueArray = unusedValidVariables
                        .map(function (node) { return node.toJSON().value; })
                        .reverse();
                    var changeValue = utils_1.accessors.changeValue(changeValueArray);
                    if (start) {
                        var column = start.column, line = start.line;
                        var startLine = line - 1;
                        _this.addGutterIcon(startLine);
                        if ((_a = _this.codeLensSettings) === null || _a === void 0 ? void 0 : _a.findUnusedImports) {
                            var plural = changeValueArray.length > 1;
                            var range = new vscode_1.Range(startLine, column, startLine, column + changeValue.length);
                            var codeLens = new vscode_1.CodeLens(range);
                            codeLens.command = {
                                title: "The variable" + (plural ? 's' : '') + " " + changeValue + " " + (plural ? 'are' : 'is') + " not used in this file. Click to remove.",
                                command: "tkww.removeVariables",
                                arguments: [unusedValidVariables],
                            };
                            _this.codeLenses.push({
                                codeLens: codeLens,
                                startLine: startLine,
                                type: 'unused',
                            });
                        }
                    }
                }
            });
        };
        this.addGutterIcon = function (line) {
            var _a;
            var editor = vscode_1.window.activeTextEditor;
            if (editor && ((_a = _this.codeLensSettings) === null || _a === void 0 ? void 0 : _a.gutterIcon)) {
                var decorationRenderOptions = {
                    gutterIconPath: utils.gutterIconPath(_this.initializer.context),
                    gutterIconSize: 'contain',
                };
                var range = new vscode_1.Range(line, 0, line, 0);
                var decoration = vscode_1.window.createTextEditorDecorationType(decorationRenderOptions);
                _this.gutterIcons.push(decoration);
                editor.setDecorations(decoration, [range]);
            }
        };
        this.initializer = initializer;
        vscode_1.workspace.onDidChangeConfiguration(function (_) {
            _this.codeLensSettings = utils.settings();
        });
    }
    StyleCodeLens.prototype.provideCodeLenses = function (document) {
        this.codeLenses = [];
        this.gutterIcons.forEach(function (gutterIcon) { return gutterIcon.dispose(); });
        var codeLensSettings = this.codeLensSettings;
        if (codeLensSettings && Object.values(codeLensSettings).some(function (setting) { return setting; })) {
            var text = document.getText();
            var clientFile = scss_parser_1.parse(text);
            var queryFile = query_ast_1.default(clientFile)();
            if (codeLensSettings.findConverts || codeLensSettings.gutterIcon) {
                this.changeType(queryFile);
            }
            if (codeLensSettings.findUnusedImports || codeLensSettings.gutterIcon) {
                this.findUnused(queryFile);
            }
            if (codeLensSettings.findInvalidImports) {
                this.findInvalidImports(queryFile);
            }
        }
        return utils.getCodeLenses(this.codeLenses);
    };
    return StyleCodeLens;
}());
exports.default = StyleCodeLens;
//# sourceMappingURL=StyleCodeLens.js.map