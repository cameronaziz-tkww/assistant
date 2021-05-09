import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
import findParent from './findParent';
import * as typeguards from '../typeguards';

const isModuleBlock = (
  node: TSESTree.ProgramStatement,
  name: string,
): TSESTree.TSModuleBlock | null => {
  if (
    typeguards.isExportNamedDeclaration(node)
  && node.declaration
  && typeguards.isTSModuleDeclaration(node.declaration)
  && typeguards.isIdentifier(node.declaration.id)
  && node.declaration.id.name === name
  && node.declaration.body
  ) {
    return node.declaration.body;
  }
  return null;
};

const moduleExportedMembers = <T extends TSESTree.Node>(
  node: T,
  name: string,
): TSESTree.ExportDeclaration[] => {
  const moduleDeclaration = findParent<TSESTree.TSModuleDeclaration>(
    node,
    AST_NODE_TYPES.TSModuleDeclaration,
  );

  if (!moduleDeclaration || !moduleDeclaration.body) {
    return [];
  }

  const { body: childrenNodes } = moduleDeclaration.body;

  const namedNode = childrenNodes
    .find((childNode) => !!isModuleBlock(childNode, name));

  if (!namedNode) {
    return [];
  }


  const moduleBlock = isModuleBlock(namedNode, name);

  if (!moduleBlock) {
    return [];
  }

  return moduleBlock.body
    .map<TSESTree.ExportDeclaration | null>((declaration) =>
      typeguards.isExportNamedDeclaration(declaration) && !!declaration.declaration
        ? declaration.declaration
        : null,
    )
    .filter(
      (declaration): declaration is TSESTree.ExportDeclaration =>
        declaration !== null,
    );
};

export default moduleExportedMembers;
