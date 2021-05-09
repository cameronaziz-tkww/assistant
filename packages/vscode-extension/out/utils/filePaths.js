"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getWorkspacePath = function (workspaceFolders) { return workspaceFolders[0].uri.path; };
var getFileName = function (filePath, workspaceFolders) {
    var path = workspaceFolders ? getWorkspacePath(workspaceFolders) : '';
    return filePath.replace(path, '');
};
exports.default = {
    getFileName: getFileName,
    getWorkspacePath: getWorkspacePath,
};
//# sourceMappingURL=filePaths.js.map