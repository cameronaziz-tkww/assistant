import * as vscode from 'vscode';

const outputChannel = () => {
  const channel = vscode.window.createOutputChannel('TKWW');
  return channel;
};

export default outputChannel;
