import * as vscode from 'vscode';
import Colorizer from '../providers/Colorize';

const colorize = (application: Instance.Application) => {
  const colorizer = new Colorizer(application);

  vscode.workspace.onDidOpenTextDocument(colorizer.onLoad);
  vscode.workspace.onDidChangeTextDocument(colorizer.onChange);
};

export default colorize;
