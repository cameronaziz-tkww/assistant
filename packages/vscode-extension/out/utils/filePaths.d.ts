import * as vscode from 'vscode';
declare const _default: {
    getFileName: (filePath: string, workspaceFolders?: readonly vscode.WorkspaceFolder[] | undefined) => string;
    getWorkspacePath: (workspaceFolders: readonly vscode.WorkspaceFolder[]) => string;
};
export default _default;
