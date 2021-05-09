import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { getMessageId } from '../messages';
import type { Delimiter } from '../../types';

interface RuleOption {
  delimiter: Delimiter;
  requireLast?: boolean;
}

type RequiredMessageIds = 'unexpected' | 'expected';

interface ReportConfig<T extends RequiredMessageIds> {
  context: Context<T>;
  token: TSESTree.Token | null;
  option: RuleOption;
  node: TSESTree.Node;
  isLast?: boolean;
}

type Action = 'remove' | 'replace' | 'insert';

type Context <T extends RequiredMessageIds> = TSESLint.RuleContext<T, unknown[]>;

type DelimiterPresent = Exclude<Delimiter, 'none'>;

interface EvaluateResult {
  delimiterFound?: DelimiterPresent;
  action: Action;
}

const analyzeSemi = (option: RuleOption): EvaluateResult | null => {
  switch(option.delimiter) {
    case 'comma': return {
      action: 'replace',
      delimiterFound: 'semi',
    };
    case 'none': return {
      delimiterFound: 'semi',
      action: 'remove',
    };
    default: return null;
  }
};

const analyzeComma = (option: RuleOption): EvaluateResult | null => {
  switch(option.delimiter) {
    case 'semi': return {
      action: 'replace',
      delimiterFound: 'comma',
    };
    case 'none': return {
      action: 'remove',
      delimiterFound: 'comma',
    };
    default: return null;
  }
};

const optionValue = (option: RuleOption): string => option.delimiter === 'semi' ? ';' : ',';
const oppositeValue = (option: RuleOption): string => option.delimiter === 'semi' ? ',' : ';';
const oppositeDelimiter = (option: RuleOption): Delimiter => option.delimiter === 'semi' ? 'comma' : 'semi';

const analyzeOther = (option: RuleOption): EvaluateResult | null => {
  switch(option.delimiter) {
    case 'semi': return {
      action: 'insert',
    };
    case 'comma': return {
      action: 'insert',
    };
    default: return null;
  }
};

const switchAnalyze = (
  token: TSESTree.Token,
  option: RuleOption,
) => {
  switch(token.value) {
    case ';': return analyzeSemi(option);
    case ',': return analyzeComma(option);
    default: return analyzeOther(option);
  }
};

const analyzeLast = (
  token: TSESTree.Token,
  option: RuleOption,
) => {
  if (option.requireLast) {
    return switchAnalyze(token, option);
  }

  if (token.value === oppositeValue(option)) {
    return {
      action: 'replace',
      delimiterFound: oppositeDelimiter(option),
    };
  }

  return null;
};

const evaluateValue = (
  token: TSESTree.Token | null,
  option: RuleOption,
  isLast?: boolean,
) => {

  if (!token) {
    return analyzeOther(option);
  }

  if (isLast) {
    return analyzeLast(token, option);
  }

  return switchAnalyze(token, option);
};

const delimiter = <T extends RequiredMessageIds>(config: ReportConfig<T>) => {
  const {
    context,
    token,
    option,
    node,
    isLast,
  } = config;

  const expected = 'expected' as T;
  const unexpected = 'unexpected' as T;

  const evaluateResult = evaluateValue(token, option, isLast);

  if (evaluateResult) {
    const { action, delimiterFound } = evaluateResult;
    const isExpected = typeof delimiterFound === 'undefined';
    const reportNode = token || node;

    const messageId = isExpected
      ? getMessageId(expected, context)
      : getMessageId(unexpected, context);

    context.report({
      node: reportNode,
      loc: {
        start: {
          line: reportNode.loc.end.line,
          column: reportNode.loc.end.column,
        },
        end: {
          line: reportNode.loc.end.line,
          column: reportNode.loc.end.column,
        },
      },
      messageId,
      data: {
        delimiter: isExpected
          ? option.delimiter
          : delimiterFound,
      },
      fix(fixer) {
        if (action === 'remove' && token) {
          // remove the unneeded token
          return fixer.remove(token);
        }

        if (action === 'insert') {
          // add the missing delimiter
          const replacement = option.delimiter === 'comma' ? ',' : ';';
          return fixer.insertTextAfter(reportNode, replacement);
        }

        // correct the current delimiter
        return fixer.replaceText(reportNode, optionValue(option));

      },
    });
  }
};

export default delimiter;
