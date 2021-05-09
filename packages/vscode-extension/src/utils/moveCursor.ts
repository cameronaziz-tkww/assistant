import { TextEditor, Selection } from 'vscode';

const moveCursor = (textEditor: TextEditor) => {
  const position = textEditor.selection.active;
  const newPosition = position.with(0, 0);
  const newSelection = new Selection(newPosition, newPosition);

  textEditor.selection = newSelection;
};

export default moveCursor;
