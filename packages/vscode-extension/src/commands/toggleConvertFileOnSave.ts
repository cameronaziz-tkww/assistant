import { constants } from '@tkww-assistant/utils';
import { commands, workspace, window } from 'vscode';

const createCommand = () => {
  const command = commands.registerCommand('tkww.toggleConvertFileOnSave', () => {
    // Get configuration for TKWW
    const config = workspace.getConfiguration(constants.configurationSection);

    // Get `convertFileOnSave` setting.
    const originalValue = config.get<boolean>('convertFileOnSave');

    // Update the setting.
    config.update('convertFileOnSave', !originalValue);

    // Log to output channel
    window.showInformationMessage(`Files will ${!originalValue ? '' : 'not'} be modified on save.`);
  });

  return command;
};

export default createCommand;
