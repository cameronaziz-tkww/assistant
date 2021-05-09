import { TSESTree, AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/experimental-utils';
import * as NodeHelperTypes from '../types/NodeHelperTypes';

export const isTSUnionType = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSUnionType =>
  unknown?.type === AST_NODE_TYPES.TSUnionType;

export const isBlockComment = (unknown?: TSESTree.Token | null): unknown is TSESTree.BlockComment =>
  unknown?.type === AST_TOKEN_TYPES.Block;

export const isLineComment = (unknown?: TSESTree.Token | null): unknown is TSESTree.LineComment =>
  unknown?.type === AST_TOKEN_TYPES.Line;

export const isTupleType = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSTupleType =>
  unknown?.type === AST_NODE_TYPES.TSTupleType;

export const isIntersectionType = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSIntersectionType =>
  unknown?.type === AST_NODE_TYPES.TSIntersectionType;

export const isLiteralType = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSLiteralType =>
  unknown?.type === AST_NODE_TYPES.TSLiteralType;

export const isLiteral = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.Literal =>
  unknown?.type === AST_NODE_TYPES.Literal;

export const isTSTypeReference = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSTypeReference =>
  unknown?.type === AST_NODE_TYPES.TSTypeReference;

export const isUndefinedKeyword = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSUndefinedKeyword =>
  unknown?.type === AST_NODE_TYPES.TSUndefinedKeyword;

export const isNumberKeyword = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSNumberKeyword =>
  unknown?.type === AST_NODE_TYPES.TSNumberKeyword;

export const isStringKeyword = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSStringKeyword =>
  unknown?.type === AST_NODE_TYPES.TSStringKeyword;

export const isAssignmentPattern = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.AssignmentPattern =>
  unknown?.type === AST_NODE_TYPES.AssignmentPattern;

export const isNullKeyword = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSNullKeyword =>
  unknown?.type === AST_NODE_TYPES.TSNullKeyword;

export const isIdentifier = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.Identifier =>
  unknown?.type === AST_NODE_TYPES.Identifier;

export const isMemberExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.MemberExpression =>
  unknown?.type === AST_NODE_TYPES.MemberExpression;

export const isBlockStatement = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.BlockStatement =>
  unknown?.type === AST_NODE_TYPES.BlockStatement;

export const isExpressionStatement = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ExpressionStatement =>
  unknown?.type === AST_NODE_TYPES.ExpressionStatement;

export const isCallExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.CallExpression =>
  unknown?.type === AST_NODE_TYPES.CallExpression;

export const isTSQualifiedName = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSQualifiedName =>
  unknown?.type === AST_NODE_TYPES.TSQualifiedName;

export const isEntityName = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.EntityName =>
  isIdentifier(unknown) || isTSQualifiedName(unknown);

export const isArrayExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ArrayExpression =>
  unknown?.type === AST_NODE_TYPES.ArrayExpression;

export const isArrayPattern = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ArrayPattern =>
  unknown?.type === AST_NODE_TYPES.ArrayPattern;

export const isEmptyBodyFunctionExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSEmptyBodyFunctionExpression =>
  unknown?.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression;

export const isProperty = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.Property =>
  unknown?.type === AST_NODE_TYPES.Property;

export const isObjectPattern = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ObjectPattern =>
  unknown?.type === AST_NODE_TYPES.ObjectPattern;

export const isObjectExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ObjectExpression =>
  unknown?.type === AST_NODE_TYPES.ObjectExpression;

export const isTSModuleDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSModuleDeclaration =>
  unknown?.type === AST_NODE_TYPES.TSModuleDeclaration;
export const isModuleDeclaration = isTSModuleDeclaration;

export const isArrowFunctionExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ArrowFunctionExpression =>
  unknown?.type === AST_NODE_TYPES.ArrowFunctionExpression;

export const isIdentifierNotLiteral = (unknown?: TSESTree.Identifier | TSESTree.Literal): unknown is TSESTree.Identifier =>
  unknown?.type === AST_NODE_TYPES.Identifier;

export const isTSTypeAliasDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSTypeAliasDeclaration =>
  unknown?.type === AST_NODE_TYPES.TSTypeAliasDeclaration;

export const isTSInterfaceDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TSInterfaceDeclaration =>
  unknown?.type === AST_NODE_TYPES.TSInterfaceDeclaration;

export const isTSPropertySignature = (unknown?: TSESTree.TypeElement): unknown is TSESTree.TSPropertySignature =>
  unknown?.type === AST_NODE_TYPES.TSPropertySignature;

export const isExportNamedDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ExportNamedDeclaration =>
  unknown?.type === AST_NODE_TYPES.ExportNamedDeclaration;

export const isVariableDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.VariableDeclaration =>
  unknown?.type === AST_NODE_TYPES.VariableDeclaration;

export const isVariableDeclarator = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.VariableDeclarator =>
  unknown?.type === AST_NODE_TYPES.VariableDeclarator;

export const isVariable = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.VariableDeclarator =>
  unknown?.type === AST_NODE_TYPES.VariableDeclarator;

export const isAliasOrInterfaceDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is NodeHelperTypes.AliasOrInterfaceDeclaration =>
  unknown?.type === AST_NODE_TYPES.TSInterfaceDeclaration
  || unknown?.type === AST_NODE_TYPES.TSTypeAliasDeclaration;

export const isImportDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ImportDeclaration =>
  unknown?.type === AST_NODE_TYPES.ImportDeclaration;

export const isImportSpecifier = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ImportSpecifier =>
  unknown?.type === AST_NODE_TYPES.ImportSpecifier;

export const isImportDefaultSpecifier = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ImportDefaultSpecifier =>
  unknown?.type === AST_NODE_TYPES.ImportDefaultSpecifier;

export const isFunctionDeclaration = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.FunctionDeclaration =>
  unknown?.type === AST_NODE_TYPES.FunctionDeclaration;

export const isFunctionExpression = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.FunctionExpression =>
  unknown?.type === AST_NODE_TYPES.FunctionExpression;

export const isFunctionValue = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is NodeHelperTypes.FunctionValue =>
  isFunctionExpression(unknown) || isFunctionDeclaration(unknown) || isArrowFunctionExpression(unknown);

export const isReturnStatement = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.ReturnStatement =>
  unknown?.type === AST_NODE_TYPES.ReturnStatement;

export const isRestElement = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.RestElement =>
  unknown?.type === AST_NODE_TYPES.RestElement;

export const hasName = <T>(unknown?: T): unknown is NodeHelperTypes.NodeWithName<T> =>
  typeof (unknown as NodeHelperTypes.NodeWithName<T>).name !== 'undefined';

export const hasType = <T>(unknown?: T): unknown is NodeHelperTypes.NodeWithType<T> =>
  typeof (unknown as NodeHelperTypes.NodeWithType<T>).type !== 'undefined';

export const hasLocal = <T>(unknown?: T): unknown is NodeHelperTypes.NodeWithLocal<T> =>
  typeof (unknown as NodeHelperTypes.NodeWithLocal<T>).local !== 'undefined';

export const hasValue = <T>(unknown?: T): unknown is NodeHelperTypes.NodeWithValue<T> =>
  typeof (unknown as NodeHelperTypes.NodeWithValue<T>).value !== 'undefined';

export const hasId = <T>(unknown?: T): unknown is NodeHelperTypes.NodeWithId<T> =>
  typeof (unknown as NodeHelperTypes.NodeWithId<T>).id !== 'undefined';

export const isTypeElement = (unknown?: NodeHelperTypes.NodeWithType | null): unknown is TSESTree.TypeElement =>
  unknown?.type === AST_NODE_TYPES.TSCallSignatureDeclaration
  || unknown?.type === AST_NODE_TYPES.TSConstructSignatureDeclaration
  || unknown?.type === AST_NODE_TYPES.TSIndexSignature
  || unknown?.type === AST_NODE_TYPES.TSMethodSignature
  || unknown?.type === AST_NODE_TYPES.TSPropertySignature;

export function isFunction(
  node: TSESTree.Node | undefined,
): node is
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression {
  if (!node) {
    return false;
  }

  return [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.FunctionExpression,
  ].includes(node.type);
}

export function isLoop(
  node: TSESTree.Node | undefined | null,
): node is
  | TSESTree.DoWhileStatement
  | TSESTree.ForStatement
  | TSESTree.ForInStatement
  | TSESTree.ForOfStatement
  | TSESTree.WhileStatement {
  if (!node) {
    return false;
  }

  return (
    node.type === AST_NODE_TYPES.DoWhileStatement ||
    node.type === AST_NODE_TYPES.ForStatement ||
    node.type === AST_NODE_TYPES.ForInStatement ||
    node.type === AST_NODE_TYPES.ForOfStatement ||
    node.type === AST_NODE_TYPES.WhileStatement
  );
}
