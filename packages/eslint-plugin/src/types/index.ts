import type { TSESTree } from '@typescript-eslint/experimental-utils';
import type { RuleMessages, MessageIds } from '../util/messages';

export * from './constToType';
export * from './NodeHelperTypes';
export * from './propertyNamesOnly';
export * from './Settings';
export * from './exportDeclarations';
export * from './util';
export * from './options';

export interface FileMatch {
  isMatchedFile: boolean;
  file: string;
  matchResult: string[];
  filename: string;
  moduleNameRaw: string;
  moduleName: string;
  filenamePieces: string[];
  filenamePathPieces: string[];
  fileExtension: string;
}

export declare function MergeDeep<T>(target: T): T;
export declare function MergeDeep<T, U>(target: T, source: U): T & U;
export declare function MergeDeep<T, U, V>(target: T, source1: U, source2: V): T & U & V;
export declare function MergeDeep<T, U, V, W>(
  target: T,
  source1: U,
  source2: V,
  source3: W,
): T & U & V & W;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare function MergeDeep (target: object, ...sources: any[]): any;
export type ObjectLike = object | unknown[];
export type Value = string | number | bigint | boolean | RegExp | null;

export enum VariableType {
  RestElement,
  Identifier,
}

interface VariableBase {
  name: string;
}

interface IdentifierVariable extends VariableBase {
  kind: VariableType.Identifier;
}

interface RestElementVariable extends VariableBase {
  kind: VariableType.RestElement;
  location: Value;
}

export type Variable = IdentifierVariable | RestElementVariable;

export interface ExportedFunction {
  name: string;
  calledDispatch: boolean;
  parameterName?: string;
  dispatchVariables: Variable[];
  dispatchRange?: TSESTree.Range;
}

export type SearchMatch =
  | 'actionCreatorDefinitions'
  | 'actionCreators'
  | 'state'
  | 'goodState'
  | 'thunks'
  | 'thunksDispatch'
  | 'eslintSchemaValid';

export type RuleType = 'redux-project-roots' | 'eslint-rules-roots';

export interface FileLocation {
  ruleType: RuleType;
  match: string[];
  ignore?: string[];
}

export type FileLocations = {
  [key in SearchMatch]: FileLocation
};

export type Delimiter = 'none' | 'semi' | 'comma';

export interface BaseToken extends TSESTree.BaseNode {
  value: string;
}

export interface Message<T extends RuleMessages> {
  messageId?: MessageIds<T>;
  missingDelimiter: boolean;
}
