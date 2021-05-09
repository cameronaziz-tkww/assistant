import { ASTUtils, TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

const findVariable = <T extends TSESTree.BaseNode>(
  scope: TSESLint.Scope.Scope,
  node: string | T,
) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
    ASTUtils.findVariable(scope, node);

export default findVariable;
