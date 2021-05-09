import { QueryWrapper, Node } from 'query-ast';
import { SCSSNode, StylesheetNodeType } from 'scss-parser';

export { default as file } from './file';
export { default as matchNodeValue } from './matchNodeValue';
export { default as value } from './value';

export declare namespace Payload {
  interface Match<T extends string = string, U extends object = Node> {
    source: QueryWrapper<StylesheetNodeType, SCSSNode>
    change: QueryWrapper<T, U>
  }
}