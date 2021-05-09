import { constants } from '@tkww-assistant/utils';
import { workspace, commands } from 'vscode';

const convertFileOnSave = () => {

  const onSave = () => {
    // Get configuration for TKWW
    const config = workspace.getConfiguration(constants.configurationSection);

    // Get `convertFileOnSave` setting.
    const onSave = config.get('convertFileOnSave');

    // If convertFileOnSave = true, convertFile file.
    if (onSave) {
      commands.executeCommand('tkww.convertFile');
    }
  };

  workspace.onWillSaveTextDocument(onSave);
};

export default convertFileOnSave;
