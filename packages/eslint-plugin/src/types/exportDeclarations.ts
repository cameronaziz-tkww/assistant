import { TSESTree } from '@typescript-eslint/experimental-utils';

export interface Parameter {
  node: TSESTree.Parameter,
  name: string | null;
}

type ReturnDeclarationNode = TSESTree.Statement | TSESTree.ArrowFunctionExpression;

export interface ReturnStatement {
  parameters: Parameter[];
  node: ReturnDeclarationNode;
  hasDispatched: boolean;
}

export enum ExportDeclarationKind {
  Arrow,
  Function,
}

interface ArrowResult {
  declarationKind: ExportDeclarationKind.Arrow;
  declarationWrappers: ReturnStatement[]
}

interface FunctionResult {
  declarationKind: ExportDeclarationKind.Function;
  declarationWrapper: ReturnStatement;
}

export type ExportDeclarationWrapper = ArrowResult | FunctionResult | null;
