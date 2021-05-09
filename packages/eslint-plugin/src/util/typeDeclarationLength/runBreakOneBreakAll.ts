import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import report from './report';
import { RunTaskConfig } from './types';

const runBreakOneBreakAll = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
  >(config: RunTaskConfig<T, U>) => {
  const {
    declarationType,
    node,
    startingLine,
    typeKey,
  } = config;

  const types = node[typeKey] as TSESTree.TypeNode[];

  const breakOneBreakAll = types.some(
    (n, index) => {
      const { line } = n.loc.start;
      if (line === startingLine || line > startingLine + index) {
        return false;
      }
      return true;
    },
  );

  if (breakOneBreakAll) {
    report({
      ...config,
      data: {
        declarationType,
      },
      messageId: 'breakOneBreakAll',
    });
    return true;
  }
  return false;
};

export default runBreakOneBreakAll;
