import { file } from '@tkww-assistant/convert';
import { constants } from '@tkww-assistant/utils';
import * as vscode from 'vscode';
import { updateText } from '../utils';

const createCommand = (application: Instance.Application) => {
  // Create `convertFile` command.
  const command = vscode.commands.registerCommand('tkww.convertFile', () => {
    const { activeTextEditor, showInformationMessage } = vscode.window;

    // If no text editor is open, exit.
    if (!activeTextEditor) {
      return;
    }

    const { languageId, getText, fileName } = activeTextEditor.document;

    // If the file extension is wrong, exit.
    if (!constants.supportedLanguageExt.includes(languageId)) {
      return;
    }

    // Get text of file and convert to array.
    let text = getText();

    const dependencies = application.dependencies;

    // Convert text.
    const modifiedCSS = file(text, dependencies);

    if (modifiedCSS !== text) {
      // Write the text in the file.
      updateText(modifiedCSS, activeTextEditor);

      // Log to output channel.
      showInformationMessage('This file was modified.');
    }
  });

  return command;
};

export default createCommand;
