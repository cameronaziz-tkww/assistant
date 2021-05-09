import { constants } from '@tkww-assistant/utils';
import * as vscode from 'vscode';
import StyleCodeLens from '../providers/StyleCodeLens';

const codeLens = (application: Instance.Application) => {
  const colorizerLensProvider = new StyleCodeLens(application);

  vscode.languages.registerCodeLensProvider(constants.supportedLanguageExt, colorizerLensProvider);
};

export default codeLens;
