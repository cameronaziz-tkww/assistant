import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import { RunTaskConfig } from './types';
import report from './report';

const runIsTooWide = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>
>(config: RunTaskConfig<T, U>) => {
  const {
    attributeOptions,
    declarationType,
    node,
    typeKey,
  } = config;
  const types = node[typeKey] as TSESTree.TypeNode[];

  const endColumns = types
    .filter((type) => type.loc.end.line === node.loc.end.line)
    .map((type) => type.loc.end.column);
  const widest = Math.max(...endColumns);
  const isTooWide = widest > attributeOptions.maxLength;

  if (isTooWide) {
    report({
      ...config,
      data: {
        declarationType,
        widest,
        maxLength: attributeOptions.maxLength,
      },
      messageId: 'tooLong',
    });
    return true;
  }
  return false;
};

export default runIsTooWide;
