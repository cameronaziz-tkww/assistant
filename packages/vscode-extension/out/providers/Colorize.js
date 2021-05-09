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
var utils_1 = require("@tkww-assistant/utils");
var scssAST = __importStar(require("scss-parser"));
var vscode_1 = require("vscode");
var query_ast_1 = __importDefault(require("query-ast"));
var Colorizer = /** @class */ (function () {
    function Colorizer(initializer) {
        var _this = this;
        this.onChange = function () {
            _this.decorationTypes.forEach(function (decorationType) {
                decorationType.dispose();
            });
            _this.analyzeFile();
        };
        this.onLoad = function () {
            _this.analyzeFile();
        };
        this.buildHexVariables = function () {
            var hexVariables = {};
            var colorHex = _this.initializer.dependecyASTQ
                .find('rule')
                .has('color_hex');
            for (var i = 0; i < colorHex.length(); i += 1) {
                var currentColorHex = colorHex.eq(i);
                var hexValue = currentColorHex
                    .find(function (_a) {
                    var node = _a.node;
                    return node.type === 'from';
                })
                    .find(function (_a) {
                    var node = _a.node;
                    return node.type === 'color_hex';
                })
                    .value();
                var identifierValue = currentColorHex
                    .find(function (_a) {
                    var node = _a.node;
                    return node.type === 'value';
                })
                    .find(function (_a) {
                    var node = _a.node;
                    return node.type === 'identifier';
                })
                    .value();
                hexVariables[identifierValue] = hexValue;
            }
            ;
            return hexVariables;
        };
        this.analyzeFile = function () {
            var colorize = vscode_1.workspace
                .getConfiguration(utils_1.constants.configurationSection)
                .get('colorize');
            if (colorize && colorize.enable) {
                var activeTextEditor_1 = vscode_1.window.activeTextEditor, createTextEditorDecorationType_1 = vscode_1.window.createTextEditorDecorationType;
                if (!activeTextEditor_1) {
                    return;
                }
                var _a = activeTextEditor_1.document, getText = _a.getText, languageId = _a.languageId;
                if (!utils_1.constants.supportedLanguageExt.includes(languageId)) {
                    return;
                }
                var nodeFile = scssAST.parse(getText());
                var queryFile = query_ast_1.default(nodeFile);
                var hexVariables_1 = _this.buildHexVariables();
                var isDarkTheme_1 = vscode_1.window.activeColorTheme.kind === 2;
                queryFile()
                    .find('identifier')
                    .map(function (node) {
                    var value = node.node.value;
                    if (utils_1.typeGuards.valueIsString(value)) {
                        var foundValue = hexVariables_1[value];
                        var start = node.node.start;
                        if (foundValue && start) {
                            var l = utils_1.color.hexToHSL(foundValue, true).l;
                            var decorationRenderOptions = {
                                color: "#" + foundValue,
                            };
                            var flip = isDarkTheme_1 ? l < 30 : l > 70;
                            if (colorize.invertBackgroundColor && flip) {
                                var inverse = utils_1.color.invertColor(foundValue);
                                var backgroundColor = utils_1.color.hexToRGB(inverse, 0.4);
                                decorationRenderOptions.backgroundColor = backgroundColor;
                            }
                            var decorationType = createTextEditorDecorationType_1(decorationRenderOptions);
                            _this.decorationTypes.push(decorationType);
                            var range = new vscode_1.Range(start.line - 1, start.column, start.line - 1, start.column + node.node.value.length);
                            activeTextEditor_1.setDecorations(decorationType, [range]);
                        }
                    }
                });
            }
        };
        this.initializer = initializer;
        this.decorationTypes = [];
    }
    return Colorizer;
}());
exports.default = Colorizer;
//# sourceMappingURL=Colorize.js.map