import * as vscode from 'vscode';
import { value, Payload } from '@tkww-assistant/convert';
import { ValueType } from 'query-ast';
import { stringify } from 'scss-parser';
import { updateText, moveCursor } from '../utils';

const createCommand = () => {
  // Create `convertValue` command.
  const command = vscode
    .commands
    .registerCommand('tkww.convertValue', (match: Payload.Match<ValueType>) => {
      const { activeTextEditor, showInformationMessage } = vscode.window;

      // If no text editor is open, exit.
      if (!activeTextEditor) {
      // This should never happen.
        return;
      }

      value(match)

      const modified = match.source.parents('stylesheet').get(0);
      const css = stringify(modified);

      // Write the text in the file.
      updateText(css, activeTextEditor);

      // Move the cursor to the top left of the editor.
      moveCursor(activeTextEditor);

      // Log to output channel.
      showInformationMessage('This file was modified.');
    });

  return command;
};

export default createCommand;
