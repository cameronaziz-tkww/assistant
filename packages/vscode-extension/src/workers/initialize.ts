import { commands as vscodeCommands, workspace, window } from 'vscode';
import * as commands from '../commands';
import * as register from '../register';
import { startup } from '../utils';

const initialize = async (application: Instance.Application) => {
  const { executeCommand } = vscodeCommands;
  const { workspaceFolders } = workspace;
  const statusBarItem = window.createStatusBarItem(1);
  statusBarItem.text = '$(sync~spin) TKWW Assistant: Initializing';
  statusBarItem.show();

  // Log startup information.
  startup(application);

  // If no workspace is open, display message.
  if (!workspaceFolders) {
    return;
  }

  statusBarItem.text = '$(sync~spin) TKWW Assistant: Loading Features';
  const { subscriptions } = application.context;

  register.convertFileOnSave();
  register.colorize(application);
  register.codeLens(application);
  subscriptions.push(register.intellisense(application));
  subscriptions.push(register.hover(application));

  // Private commands
  subscriptions.push(commands.convertValue());
  subscriptions.push(commands.removeVariables());

  // Public Commands
  subscriptions.push(commands.convertFile(application));
  executeCommand('setContext', 'extension:convertFile', true);

  subscriptions.push(commands.clearLocalStorage(application));

  subscriptions.push(commands.toggleConvertFileOnSave());
  executeCommand('setContext', 'extension:toggleConvertFileOnSave', true);

  executeCommand('setContext', 'extension:initialized', true);

  statusBarItem.dispose();
};

export default initialize;
