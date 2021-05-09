"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var scss_parser_1 = require("scss-parser");
var query_ast_1 = __importDefault(require("query-ast"));
var parseDocument = function (document) {
    try {
        var text = document.getText();
        var nodeFile = scss_parser_1.parse(text);
        var queryFile = query_ast_1.default(nodeFile);
        return queryFile();
    }
    catch (error) {
        return;
    }
};
exports.default = parseDocument;
//# sourceMappingURL=parseDocument.js.map