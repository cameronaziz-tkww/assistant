import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';

export type NodeWithName<T = TSESTree.BaseNode> = T & {
  name: TSESTree.Identifier;
};

export type NodeWithType<T = TSESTree.BaseNode> = T & {
  type: AST_NODE_TYPES;
};

export type NodeWithValue<T = TSESTree.BaseNode> = T & {
  value: string;
};

export type NodeWithLocal<T = TSESTree.BaseNode> = T & {
  local: TSESTree.Identifier;
};

export type NodeId =
  | TSESTree.Identifier
  | TSESTree.BindingName
  | TSESTree.PropertyNameNonComputed
  | TSESTree.PropertyNameComputed
  | TSESTree.Literal
  | null;

export type NodeWithId<T = TSESTree.BaseNode> = T & {
  id: NodeId
};

export type AliasOrInterfaceDeclaration =
  | TSESTree.TSTypeAliasDeclaration
  | TSESTree.TSInterfaceDeclaration;

export type FunctionValue =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;
