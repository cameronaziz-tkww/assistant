import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import report from './report';
import shouldAlwaysBreak from './shouldAlwaysBreak';
import { RunTaskConfig } from './types';

const runAlwaysBreak = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
>(config: RunTaskConfig<T, U>) => {
  const {
    attributeOptions,
    declarationType,
    node,
    startingLine,
    typeKey,
  } = config;

  const types = node[typeKey] as TSESTree.TypeNode[];

  const alwaysBreak = shouldAlwaysBreak(attributeOptions, types) && types.some(
    (n, index) => {
      const { line } = n.loc.start;
      if (line > startingLine + index) {
        return false;
      }
      return true;
    },
  );

  if (alwaysBreak) {
    report({
      ...config,
      data: {
        declarationType,
      },
      messageId: 'shouldBreak',
    });

    return true;
  }
  return false;
};

export default runAlwaysBreak;
