/// <reference types="types-scss-parser" />
/// <reference types="types-query-ast" />
import { TextDocument } from 'vscode';
import { SCSSNode, StylesheetNodeType } from 'scss-parser';
import { QueryWrapper } from 'query-ast';
declare const parseDocument: <T extends StylesheetNodeType>(document: TextDocument) => QueryWrapper<T, SCSSNode> | undefined;
export default parseDocument;
