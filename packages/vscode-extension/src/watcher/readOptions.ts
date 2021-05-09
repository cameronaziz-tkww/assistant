import fs from 'fs';
import { window, workspace, Uri } from 'vscode';
import { filePaths } from '../utils';

const findTSConfig = async (
  workspacePieces: string[],
  filePieces: string[],
): Promise<any> => {
  if (filePieces.length < workspacePieces.length) {
    return null;
  }
  const path = `${filePieces.join('/')}/tsconfig.json`;
  const uri = Uri.file(path);
  try {
    const stats = await workspace.fs.stat(uri);
    if (Object.keys(stats).length > 0) {
      const readBuffer = await workspace.fs.readFile(uri);
      const json = Buffer
        .from(readBuffer)
        .toString('utf8');
      return JSON.parse(json);;
    }
  } catch (error) {}
  filePieces.pop();
  return findTSConfig(workspacePieces, filePieces);
};

export const readOptions = () => {
  const topDirectory = filePaths.getCurrentWorkspacePath();
  if (!topDirectory || !window.activeTextEditor) {
    return null;
  }
  const workspacePieces = topDirectory.uri.path.split('/');
  const filePieces = window.activeTextEditor.document.uri.path.split('/');
  filePieces.pop();

  return findTSConfig(workspacePieces, filePieces);
};

const findTSConfigSync = (
  workspacePieces: string[],
  filePieces: string[],
): any => {
  if (filePieces.length < workspacePieces.length) {
    return null;
  }
  const path = `${filePieces.join('/')}/tsconfig.json`;
  try {
    if (fs.existsSync(path)) {
      const json = fs.readFileSync(path, { encoding: 'utf8' });
      return JSON.parse(json);;
    }
  } catch (error) {
  }
  filePieces.pop();
  return findTSConfigSync(workspacePieces, filePieces);
};

export const readOptionsSync = () => {
  const topDirectory = filePaths.getCurrentWorkspacePath();
  console.log('~ topDirectory', topDirectory);
  if (!topDirectory || !window.activeTextEditor) {
    return null;
  }
  const workspacePieces = topDirectory.uri.path.split('/');
  const filePieces = window.activeTextEditor.document.uri.path.split('/');
  filePieces.pop();

  return findTSConfigSync(workspacePieces, filePieces);
};

export default {
  readOptions,
  readOptionsSync,
};
