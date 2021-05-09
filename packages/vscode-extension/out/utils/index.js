"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateText = exports.startup = exports.parseDocument = exports.moveCursor = exports.fileSystem = exports.filePaths = exports.errors = void 0;
var errors_1 = require("./errors");
Object.defineProperty(exports, "errors", { enumerable: true, get: function () { return __importDefault(errors_1).default; } });
var filePaths_1 = require("./filePaths");
Object.defineProperty(exports, "filePaths", { enumerable: true, get: function () { return __importDefault(filePaths_1).default; } });
var fileSystem_1 = require("./fileSystem");
Object.defineProperty(exports, "fileSystem", { enumerable: true, get: function () { return __importDefault(fileSystem_1).default; } });
var moveCursor_1 = require("./moveCursor");
Object.defineProperty(exports, "moveCursor", { enumerable: true, get: function () { return __importDefault(moveCursor_1).default; } });
var parseDocument_1 = require("./parseDocument");
Object.defineProperty(exports, "parseDocument", { enumerable: true, get: function () { return __importDefault(parseDocument_1).default; } });
var startup_1 = require("./startup");
Object.defineProperty(exports, "startup", { enumerable: true, get: function () { return __importDefault(startup_1).default; } });
var updateText_1 = require("./updateText");
Object.defineProperty(exports, "updateText", { enumerable: true, get: function () { return __importDefault(updateText_1).default; } });
//# sourceMappingURL=index.js.map