import * as vscode from 'vscode';
import Initializer from '../commands/Initializer';
declare const createCommand: (initializer: Initializer) => vscode.Disposable;
export default createCommand;
