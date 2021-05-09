"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var atrules_1 = require("@tkww-assistant/atrules");
var utils_1 = require("@tkww-assistant/utils");
var scss_parser_1 = require("scss-parser");
var query_ast_1 = __importDefault(require("query-ast"));
var vscode_1 = require("vscode");
var intellisense = function (initializer) {
    var queryCSSValues = query_ast_1.default(utils_1.validCSS.valueAST)()
        .find('data-type');
    var getKind = function (fromQuerySelector) {
        if (fromQuerySelector.has('color_hex').length() > 0) {
            return vscode_1.CompletionItemKind.Color;
        }
        if (fromQuerySelector.has('number').length() > 0) {
            return vscode_1.CompletionItemKind.Value;
        }
        return vscode_1.CompletionItemKind.Text;
    };
    var settings = function () { return vscode_1.workspace
        .getConfiguration(utils_1.constants.configurationSection)
        .get('intellisense'); };
    var additionalTextEdits = function (identifier, document) {
        var clientWrapper = utils_1.parseDocument(document.getText());
        if (!clientWrapper) {
            return [];
        }
        var atRulesWrapper = atrules_1.utils.getAtValueRules(clientWrapper);
        var currentImported = atRulesWrapper
            .find(function (_a) {
            var node = _a.node;
            return node.type === 'identifier' && node.value === identifier.value();
        });
        if (currentImported.length() > 0) {
            return [];
        }
        var dependencyName = atrules_1.getImportLocation(identifier);
        var importedRule = atRulesWrapper
            .find(function (_a) {
            var node = _a.node;
            return node.type === 'string_double' || node.type === 'string_single';
        })
            .filter(function (_a) {
            var node = _a.node;
            return node.value === dependencyName;
        })
            .parents('atrule');
        if (importedRule.length() === 0) {
            var rule = atrules_1.newRule(dependencyName, identifier);
            var ruleText = scss_parser_1.stringify(rule);
            var range = new vscode_1.Range(0, 0, 0, 0);
            var textEdit = new vscode_1.TextEdit(range, ruleText);
            return [textEdit];
        }
        var variablesWithSpace = atrules_1.utils.getDirtyVariables(importedRule);
        var maybeLastItem = variablesWithSpace.eq(variablesWithSpace.length() - 2);
        var lastItemIsNotSpace = maybeLastItem
            .filter(function (_a) {
            var node = _a.node;
            return node.type === 'space';
        })
            .length() === 0;
        var lastItem = lastItemIsNotSpace ? maybeLastItem : maybeLastItem.prev();
        var updatedVariables = lastItem
            .after(identifier.get(0))
            .after(utils_1.constants.nodes.space)
            .after(utils_1.constants.nodes.comma);
        var updatedRule = updatedVariables
            .parents('atrule')
            .get(0);
        if (updatedRule.start) {
            var ruleText = scss_parser_1.stringify(updatedRule);
            var line = updatedRule.start.line - 1;
            var range = new vscode_1.Range(line, 0, line, Number.MAX_SAFE_INTEGER);
            var textEdit = new vscode_1.TextEdit(range, ruleText);
            return [textEdit];
        }
        return [];
    };
    var provider = vscode_1.languages.registerCompletionItemProvider(utils_1.constants.supportedLanguageExt, {
        provideCompletionItems: function (document, position) {
            var completionList = [];
            if (settings()) {
                // The given line being edited.
                var text = document
                    .getText()
                    .split('\n')[position.line];
                // Parse the text, convert to AST query, get the value before the colon in a string.
                var property = query_ast_1.default(scss_parser_1.parse(text))()
                    .find(function (_a) {
                    var node = _a.node;
                    return node.type === 'punctuation' && node.value === ':';
                })
                    .prevAll()
                    .value()
                    .trim();
                var cssData_1 = utils_1.validCSS.cssValue(property);
                if (cssData_1) {
                    var definitions_1 = queryCSSValues
                        .find(function (_a) {
                        var node = _a.node;
                        return node.type === 'name' && cssData_1.values.includes(node.value);
                    })
                        .parent()
                        .find('ast');
                    var suggestionRules = initializer.dependecyASTQ
                        .find('rule')
                        .find('from')
                        .filter(function (wrapper) {
                        if (wrapper.hasChildren) {
                            return utils_1.recurseHas.childValue({
                                queryWrapper: definitions_1,
                                hasArray: wrapper.children,
                                excludedValues: ['any']
                            }).length() > 0;
                        }
                        return false;
                    })
                        .parent();
                    var _loop_1 = function (i) {
                        var suggestion = suggestionRules.eq(i);
                        var identifier = suggestion
                            .find('value')
                            .find('identifier');
                        var from = suggestion
                            .find('from');
                        var identifierValue = identifier.value().trim();
                        var terms = initializer.dependecyASTQ
                            .find('rule')
                            .find('value')
                            .filter(function (_a) {
                            var node = _a.node;
                            var nodeQuery = query_ast_1.default(node)();
                            var nodeValue = nodeQuery.value().trim();
                            if (nodeValue === identifierValue) {
                                return true;
                            }
                            return false;
                        })
                            .parent('rule')
                            .find('from')
                            .map(function (_a) {
                            var node = _a.node;
                            var nodeQuery = query_ast_1.default(node)();
                            var lead = nodeQuery.has('color_hex').length() > 0 ? '#' : '';
                            var value = nodeQuery.value().trim();
                            return "" + lead + value;
                        });
                        var completion = new vscode_1.CompletionItem(identifier.value());
                        completion.detail = "CSS Union for " + utils_1.accessors.changeValue(terms);
                        completion.kind = getKind(from);
                        completion.additionalTextEdits = additionalTextEdits(identifier, document);
                        completionList.push(completion);
                    };
                    for (var i = 0; i < suggestionRules.length(); i += 1) {
                        _loop_1(i);
                    }
                    return completionList;
                }
            }
            return completionList;
        },
    });
    return provider;
};
exports.default = intellisense;
//# sourceMappingURL=intellisense.js.map