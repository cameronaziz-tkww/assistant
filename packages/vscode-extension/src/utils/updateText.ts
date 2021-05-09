import { TextEditor, Range } from 'vscode';

const updateText = (text: string, activeTextEditor: TextEditor) => {
  const firstLine = activeTextEditor.document.lineAt(0);
  const lastLine = activeTextEditor.document.lineAt(activeTextEditor.document.lineCount - 1);
  const textRange = new Range(0,
    firstLine.range.start.character,
    activeTextEditor.document.lineCount - 1,
    lastLine.range.end.character
  );

  activeTextEditor.edit(function (editBuilder) {
    editBuilder.replace(textRange, text);
  });
};

export default updateText;
