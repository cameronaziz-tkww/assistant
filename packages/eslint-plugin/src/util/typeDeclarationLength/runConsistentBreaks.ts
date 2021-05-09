import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import { RunTaskConfig, FixConfig } from './types';
import report from './report';
import { getDelimiter, allowable } from './helpers';

interface CheckLineConfig {
  afterLine: number;
  afterShouldBeSameLine: boolean;
  allowAfterLine: boolean;
  beforeLine: number;
  isLast: boolean;
  forceAfterLine: boolean;
  typeLine: number;
}

const lineGood = (config: CheckLineConfig) => {
  const {
    afterShouldBeSameLine,
    afterLine,
    beforeLine,
    typeLine,
    forceAfterLine,
    allowAfterLine,
  } = config;

  if(afterShouldBeSameLine) {
    if (beforeLine === typeLine) {
      return false;
    }
    if (afterLine !== typeLine || forceAfterLine) {
      return false;
    }
    return true;
  }

  if (beforeLine !== typeLine) {
    return false;
  }
  if (afterLine === typeLine && !allowAfterLine) {
    return false;
  }
  return true;
};

const runConsistentBreaks = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
>(config: RunTaskConfig<T, U>) => {
  const {
    context,
    declarationType,
    node,
    typeKey,
  } = config;

  const sourceCode = context.getSourceCode();
  const afterShouldBeSameLine = declarationType === 'tuple';
  const delimiter = getDelimiter(declarationType);

  const fixConfig: FixConfig<T, U> = {
    ...config,
    data: {
      declarationType,
    },
    messageId: 'consistentBreaks',
    sourceCode,
  };

  const types = node[typeKey] as TSESTree.TypeNode[];

  // All Same Line - use .some to break early
  const isNotOneLine = types
    .some((type) => type.loc.start.line !== types[0].loc.start.line);

  if (!isNotOneLine) {
    return false;
  }

  const inConsistentBreaks = types.some(
    (type, index) => {
      const { line: typeLine } = type.loc.start;
      const isLast = index === types.length - 1;
      const beforeToken = sourceCode.getTokenBefore(
        type,
        {
          includeComments: false,
        },
      );
      const afterToken = sourceCode.getTokenAfter(
        type,
        {
          includeComments: false,
        },
      );
      if (beforeToken && afterToken) {
        const { line: beforeLine } = beforeToken.loc.start;
        const { line: afterLine } = afterToken.loc.start;

        const forceAfterLine = isLast && afterToken.value !== delimiter;
        const allowAfterLine = isLast && allowable.ends.includes(afterToken.value);

        const checkLineConfig: CheckLineConfig = {
          afterLine,
          afterShouldBeSameLine,
          allowAfterLine,
          beforeLine,
          isLast,
          forceAfterLine,
          typeLine,
        };

        return !lineGood(checkLineConfig);
      }
      return true;
    },
  );

  if (inConsistentBreaks) {
    report(fixConfig);
    return true;
  }

  return false;
};

export default runConsistentBreaks;
