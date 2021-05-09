import type { JSONSchema4 } from 'json-schema';
import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { stringLiterals, ElementType, PropertyNamesOnly } from '../../types';
import { Ids } from '../messages';
import { DECLARATION_TYPES } from './constants';

export interface RunConfig<T extends TSESTree.Node, U extends PropertyNamesOnly<T>> {
  context: Context;
  node: T;
  typeKey: U;
  options: Options;
  declarationType: DeclarationType;
}

export interface RunTaskConfig<
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
> {
  attributeOptions: AttributeOptions;
  context: Context;
  declarationType: DeclarationType;
  node: T;
  options: Options;
  startingLine: number;
  typeKey: U;
}

export interface BaseOptions {
  alwaysBreak: boolean | number;
  maxLength: number;
  breakOneBreakAll: boolean;
  consistentBreaks: boolean;
}
export type IndentWith = 'tabs' | 'spaces';

export interface GlobalOptions {
  indentWith: IndentWith;
  indentDepth: number;
}

export type ContextOptions =
	& Partial<Options>
	& Partial<BaseOptions>
  & {
    types?: readonly DeclarationType[];
  };

const values = stringLiterals(...DECLARATION_TYPES);
export type DeclarationType = ElementType<typeof values>;

export type Options = GlobalOptions & {
  [key in DeclarationType]: AttributeOptions;
};

export interface AttributeOptions extends BaseOptions {
  enabled: boolean;
}

export type MessageIds = Ids<'type-declaration-length'>;
export type Context = TSESLint.RuleContext<MessageIds, JSONSchema4[]>;

export interface BaseData {
  declarationType: DeclarationType;
}

interface DataTooLong extends BaseData {
  widest: number;
  maxLength: number;
}

interface DataShouldBreak extends BaseData {}
interface DataBreakOneBreakAll extends BaseData {}
interface DataConsistentBreaks extends BaseData {}

export type Data<T extends MessageIds> =
  T extends 'tooLong' ? DataTooLong :
  T extends 'shouldBreak' ? DataShouldBreak :
  T extends 'breakOneBreakAll' ? DataBreakOneBreakAll :
  T extends 'consistentBreaks' ? DataConsistentBreaks :
  never;

export interface FixConfig<
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
> {
  context: Context;
  data: Readonly<Data<MessageIds>>;
  messageId: MessageIds;
  node: T
  noFix?: boolean;
  preventLinebreak?: boolean;
  sourceCode?: Readonly<TSESLint.SourceCode>,
  typeKey: U;
  options: Options;
}

export type Delimiter =
	| ','
	| '|'
  | '&';
