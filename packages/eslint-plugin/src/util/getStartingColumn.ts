import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import findParent from './findParent';

export const getStartingColumn = (
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.Node | TSESTree.Token,
) => {
  const alias = findParent(node, AST_NODE_TYPES.TSTypeAliasDeclaration);
  if (alias) {
    const possibleExportToken = sourceCode.getTokenBefore(
      alias,
      {
        includeComments: false,
      },
    );

    if (
      possibleExportToken
      && possibleExportToken.value === 'export'
      && possibleExportToken.type === 'Keyword'
    ) {
      return {
        token: possibleExportToken,
        column: possibleExportToken.loc.start.column,
      };
    }

    const lead = sourceCode.getFirstToken(
      alias,
      {
        includeComments: false,
      },
    );

    if (lead) {
      return {
        token: lead,
        column: lead.loc.start.column,
      };
    }
  }
  return {
    token: null,
    column: 0,
  };
};

export default getStartingColumn;
