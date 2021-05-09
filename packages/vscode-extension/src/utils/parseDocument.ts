import { TextDocument } from 'vscode';
import { parse, SCSSNode, StylesheetNodeType } from 'scss-parser';
import query, { QueryWrapper } from 'query-ast';

const parseDocument = <T extends StylesheetNodeType>(document: TextDocument): QueryWrapper<T, SCSSNode> | undefined=> {
  try {
    const text = document.getText();
    const nodeFile = parse<T>(text);
    const queryFile = query<T, SCSSNode>(nodeFile);
    return queryFile();
  } catch (error) {
    return;
  }
};

export default parseDocument;
