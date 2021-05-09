import { workspace, Uri } from 'vscode';
import { FileSystem } from '@tkww-assistant/utils';

const readDirectoryCallback: FileSystem.ReadDirectoryCallback = async (path) => {
  const uri = Uri.file(path);
  return workspace.fs.readDirectory(uri);
};

const findFilesCallback: FileSystem.FindFilesCallback = async (pattern) => {
  const { findFiles } = workspace;
  const vsCodePattern = `{${pattern
    .split('|')
    .join(',')}}`

  const files = await findFiles(vsCodePattern);
  return files.map((file) => file.path);
};

const readFileCallback: FileSystem.ReadFileCallback = async (path) => {
  const uri = Uri.file(path);
  return workspace.fs.readFile(uri);
};

export default {
  findFilesCallback,
  readFileCallback,
  readDirectoryCallback,
}