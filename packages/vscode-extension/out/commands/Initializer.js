"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@tkww-assistant/utils");
var vscode_1 = require("vscode");
var workers_1 = require("../workers");
var Initializer = /** @class */ (function () {
    function Initializer(context) {
        var _this = this;
        this.hasInitialized = false;
        this.configuration = vscode_1.workspace.getConfiguration(utils_1.constants.configurationSection);
        this.command = vscode_1.commands.registerCommand('tkww.initializeExtension', function () {
            workers_1.initialize(_this);
        });
        this.listener = function () {
            vscode_1.workspace.onDidChangeConfiguration(function (e) {
                if (_this.autoStart() && !_this.hasInitialized) {
                    workers_1.initialize(_this);
                }
            });
            vscode_1.workspace.onDidOpenTextDocument(function (e) {
                _this.setCurrentDependency(e.uri);
            });
        };
        this.setDependencies = function (allDependencies) {
            _this.allDependencies = allDependencies;
        };
        this.setCurrentDependency = function (documentUri) {
            var currentWorkspace = vscode_1.workspace.getWorkspaceFolder(documentUri);
            _this.workspaceIndex = currentWorkspace ? currentWorkspace.index : 0;
        };
        this.autoStart = function () {
            var config = vscode_1.workspace.getConfiguration(utils_1.constants.configurationSection);
            var currentSetting = config.get('start');
            return currentSetting === 'Always' ? true : false;
        };
        this.context = context;
        this.allDependencies = [];
        this.workspaceIndex = 0;
        if (this.autoStart()) {
            workers_1.initialize(this);
            this.hasInitialized = true;
        }
        this.listener();
    }
    ;
    Object.defineProperty(Initializer.prototype, "dependecyASTQ", {
        get: function () {
            if (this.allDependencies.length === 0) {
                throw new Error('No Dependencies Found.');
            }
            return this.allDependencies[this.workspaceIndex];
        },
        enumerable: false,
        configurable: true
    });
    ;
    return Initializer;
}());
exports.default = Initializer;
//# sourceMappingURL=Initializer.js.map