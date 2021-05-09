import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
// import { Token } from 'typescript';

export const findFirstParent = <T extends AST_NODE_TYPES = AST_NODE_TYPES>(
  node: TSESTree.Node,
  types: T[],
): null | undefined | TSESTree.Node => types
    .map((type) => findParent(node, type))
    .find((n) => n !== null);

const findParent = <T extends TSESTree.Node, U extends AST_NODE_TYPES = AST_NODE_TYPES>(
  node: TSESTree.Node | TSESTree.Token,
  type: U,
): null | T => {
  if (node.type === type) {
    return node as T;
  }
  if (!node.parent) {
    return null;
  }
  return findParent(node.parent, type);
};

export default findParent;
