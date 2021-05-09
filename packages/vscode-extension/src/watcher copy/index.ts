import { window, workspace, ExtensionContext } from 'vscode';
import ASTUtil from './ASTUtil';
import variableInit from './variableInit';
import source from './source';

const parseFile = (filename: string, astUtil: ASTUtil, fresh: boolean) => {
  const ast = astUtil.get(filename, fresh);
  if (!ast) {
    return;
  }

  try {
    const init = variableInit('variable', ast);
    if (!init) {
      return;
    }
    const sourceValue = source(init, astUtil, filename);
    console.log('~ sourceValue', sourceValue, '\n\n');
  } catch (error) {
    console.log(error);
  }
};

const defaultExport = (filename: string, astUtil: ASTUtil, fresh: boolean) => {
  const ast = astUtil.get(filename, fresh);
  if (!ast) {
    return;
  }

  try {
    const init = variableInit('variable', ast);
    if (!init) {
      return;
    }
    const sourceValue = source(init, astUtil, filename);
    console.log('~ sourceValue', sourceValue, '\n\n');
  } catch (error) {
    console.log(error);
  }
};

const runWatcher = (context: ExtensionContext) => {
  const astUtil = new ASTUtil();

  const analyzeOpen = () => {
    if (window.activeTextEditor) {
      parseFile(window.activeTextEditor.document.fileName, astUtil, false);
    }
  };

  const analyzeEdit = () => {
    if (window.activeTextEditor) {
      parseFile(window.activeTextEditor.document.fileName, astUtil, true);
    }
  };

  workspace.onDidOpenTextDocument(analyzeOpen);
  workspace.onDidChangeTextDocument(analyzeEdit);
};

export default runWatcher;
