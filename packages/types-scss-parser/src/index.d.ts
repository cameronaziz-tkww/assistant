declare module 'scss-parser' {
  import { Node, ValueType } from 'query-ast';

  type StylesheetNodeType = 'stylesheet' | 'rule' | 'block' | 'declaration' | 'parentheses' |  'value' | 'block' |  'atrule' | ValueType;

  export type SCSS = {
    start?: InputStreamPosition
    end?: InputStreamPosition
  }

  export type SCSSNode = Node & SCSS;

  export interface InputStreamPosition {
    cursor: number;
    line: number;
    column: number;
  }

  export function parse<T extends string = string>(css: string): Node<T, SCSS>;

  export function stringify<T extends string = string>(node: Node<T, SCSS>): string;
}
