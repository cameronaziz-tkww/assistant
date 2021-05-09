import { constants } from '@tkww-assistant/utils';
import { stringify, StylesheetNodeType } from 'scss-parser';
import { QueryWrapper } from 'query-ast';
import * as vscode from 'vscode';
import { utils } from '@tkww-assistant/atrules';
import { updateText, moveCursor } from '../utils';

const createCommand = () => {
  // Create `convertValue` command.
  const command = vscode
    .commands
    .registerCommand('tkww.removeVariables', (unusedVariables: QueryWrapper<StylesheetNodeType>) => {
      const { activeTextEditor, showInformationMessage } = vscode.window;


      // If no text editor is open, exit.
      if (!activeTextEditor) {
      // This should never happen.
        return;
      }

      const newAtRule = unusedVariables
        .remove()
        .parents('atrule');

      const spacesRemoved = utils
        .getDirtyVariables(newAtRule)
        .filter(({ node }) => node.type === 'space' || node.type === 'punctuation')
        .remove()
        .parents('atrule');

      const cleanedVars = utils
        .getDirtyVariables(spacesRemoved as QueryWrapper<StylesheetNodeType>, true)
        .before(constants.nodes.space)
        .after(constants.nodes.comma)
        .last()
        .next()
        .replace(() => constants.nodes.space)
        .parents('atrule');

      const vars = utils
        .getDirtyVariables(cleanedVars as QueryWrapper<StylesheetNodeType>, true)

      if (vars.length() === 0) {
        const isLast = newAtRule
          .next()
          .get(0)
          .type === 'space';

        if (isLast) {
          newAtRule
            .next()
            .remove();
        }

        newAtRule.remove();
      }

      const modified = newAtRule
        .parents('stylesheet')
        .get(0);

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
