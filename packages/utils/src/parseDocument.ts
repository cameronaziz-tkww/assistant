import { parse, SCSSNode, StylesheetNodeType } from 'scss-parser';
import query, { QueryWrapper } from 'query-ast';

const parseDocument = <T extends StylesheetNodeType>(text: string): QueryWrapper<T, SCSSNode> | undefined=> {
  try {
    const nodeFile = parse<T>(text);
    const queryFile = query<T, SCSSNode>(nodeFile);
    return queryFile();
  } catch (error) {
    return;
  }
};

export default parseDocument;
