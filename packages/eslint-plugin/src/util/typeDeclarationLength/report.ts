import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import { getMessageId } from '../messages';
import createFix from './createFix';
import * as Types from './types';

const report = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
>(config: Types.FixConfig<T, U>) => {
  const { node, context, messageId, data } = config;
  const sourceCode = config.sourceCode || context.getSourceCode();

  const fix = createFix(sourceCode, config);

  context.report({
    node,
    data,
    messageId: getMessageId(messageId, context),
    fix,
  });
};

export default report;
