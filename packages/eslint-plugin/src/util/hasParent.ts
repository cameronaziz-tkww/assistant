import { TSESTree } from '@typescript-eslint/experimental-utils';

export const moduleBlock = (node: TSESTree.BaseNode) => {
  if (!node.parent) {
    return false;
  }

  if (node.parent.type === 'TSModuleBlock') {
    return true;
  }

  return moduleBlock(node.parent);
};

export const interfaceDeclaration = (node: TSESTree.BaseNode) => {
  if (!node.parent) {
    return false;
  }

  if (node.parent.type === 'TSInterfaceDeclaration') {
    return true;
  }

  return interfaceDeclaration(node.parent);
};

export const hasParent = (node: TSESTree.BaseNode, type: string) => {
  if (!node.parent) {
    return false;
  }

  if (node.parent.type === type) {
    return true;
  }

  return hasParent(node.parent, type);
};

export default hasParent;
