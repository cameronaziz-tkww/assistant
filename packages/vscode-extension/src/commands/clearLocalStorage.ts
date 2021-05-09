import { commands, window } from 'vscode';
import localStorage from '../workers/localStorage';

const createCommand = (application: Instance.Application) => {
  const command = commands.registerCommand('tkww.clearLocalStorage', () => {

    localStorage.clearStorageDependencies({
      context: application.context,
      logger: application.log,
    });

    // Log to output channel
    window.showInformationMessage('Local Storage Cleared.');
  });

  return command;
};

export default createCommand;
