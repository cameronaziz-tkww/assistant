import { window, workspace, ExtensionContext } from 'vscode';
import ASTUtil from './ASTUtil';
import variableInit from './variableInit';
import source from './source';
import handleDefaultExport from './handleDefaultExport';

const defaultExport = (filename: string, fresh: boolean) => {
  const astUtil = ASTUtil.getInstance(filename, fresh);
  handleDefaultExport(astUtil);

  try {
    const init = variableInit('variable', astUtil);
    if (!init) {
      return;
    }
    const sourceValue = source(init, astUtil);
    console.log('~ sourceValue', sourceValue, '\n\n');
  } catch {
  }
};

const runWatcher = (context: ExtensionContext) => {

  const analyzeOpen = () => {
    if (window.activeTextEditor) {
      defaultExport(window.activeTextEditor.document.fileName, true);
    }
  };

  const analyzeEdit = () => {
    if (window.activeTextEditor) {
      defaultExport(window.activeTextEditor.document.fileName, true);
    }
  };

  workspace.onDidOpenTextDocument(analyzeOpen);
  workspace.onDidChangeTextDocument(analyzeEdit);
};

export default runWatcher;
