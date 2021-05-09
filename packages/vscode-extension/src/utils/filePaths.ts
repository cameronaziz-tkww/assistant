import * as vscode from 'vscode';

const getCurrentWorkspacePath = () => {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor || !vscode.workspace.workspaceFolders) {
    return null;
  }
  return vscode.workspace.workspaceFolders
    .find((folder) => activeTextEditor.document.uri.path.startsWith(folder.uri.path)) || null;
};

const getWorkspacePath = (workspaceFolders: readonly vscode.WorkspaceFolder[]) => workspaceFolders[0].uri.path;

const getFileName = (filePath: string, workspaceFolders?: readonly vscode.WorkspaceFolder[]) => {
  const path = workspaceFolders ? getWorkspacePath(workspaceFolders) : '';
  return filePath.replace(path, '');
};

export default {
  getCurrentWorkspacePath,
  getFileName,
  getWorkspacePath,
};
