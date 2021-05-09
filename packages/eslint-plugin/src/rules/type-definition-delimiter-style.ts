import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { mergeOptions } from '../util/options';
import { mergeDeep } from '../util/hidash';
import { allMessages, MessageIds } from '../util/messages';
import delimiter from '../util/report/delimiter';
import type { Delimiter } from '../types';

interface RuleOption {
  delimiter: Exclude<Delimiter, 'comma'>;
}

interface RuleBaseOptions {
  multiline: RuleOption;
  singleline: RuleOption;
}

interface OverrideOptions {
  typeLiteral: RuleBaseOptions;
  interface: RuleBaseOptions;
};

type GlobalOptionsOnly = [RuleBaseOptions];
type WithOverrideOptions = [RuleBaseOptions, OverrideOptions];
export type RuleOptions = GlobalOptionsOnly | WithOverrideOptions;

const defaultBaseOptions: RuleBaseOptions = {
  multiline: {
    delimiter: 'none',
  },
  singleline: {
    delimiter: 'none',
  },
};

const defaultOptions: RuleOptions = [
  defaultBaseOptions,
];

const messages = allMessages['type-definition-delimiter-style'];

const option = {
  type: 'object',
  properties: {
    delimiter: {
      enum: [
        'none',
        'semi',
      ],
    },
  },
  additionalProperties: false,
};

const baseSchema = {
  type: 'object',
  properties: {
    multiline: option,
    singleline: option,
  },
  additionalProperties: false,
};

const schema = [
  baseSchema,
  {
    type: 'object',
    properties: {
      typeLiteral: baseSchema,
      interface: baseSchema,
    },
    additionalProperties: false,
  },
];

type Context = TSESLint.RuleContext<MessageIds<'type-definition-delimiter-style'>, RuleOptions>;

const meta: TSESLint.RuleMetaData<MessageIds<'type-definition-delimiter-style'>> = {
  type: 'suggestion',
  fixable: 'code',
  messages,
  schema,
};

interface RunRuleConfig {
  node: TSESTree.Node;
  options: RuleBaseOptions;
  context: Context;
  sourceCode: Readonly<TSESLint.SourceCode>
}

const runRule = (config: RunRuleConfig) => {
  const { context, sourceCode, node, options } = config;
  const isSingleLine = node.loc.start.line === node.loc.end.line;
  const option = isSingleLine ? options.singleline : options.multiline;
  const token = sourceCode.getTokenAfter(
    node,
    {
      includeComments: false,
    },
  );
  delimiter({
    node,
    token,
    context,
    option,
  });
};

const rule: TSESLint.RuleModule<MessageIds<'type-definition-delimiter-style'>, RuleOptions> = {
  meta,
  create(context) {
    const [globalOptions, nodeOptions] = mergeOptions(defaultOptions as RuleOptions, context.options);
    const sourceCode = context.getSourceCode();

    const ruleListener: TSESLint.RuleListener = {
      TSInterfaceBody: (node) => {
        const options = mergeDeep(globalOptions, nodeOptions?.interface);
        runRule({
          node,
          options,
          context,
          sourceCode,
        });
      },
      TSTypeLiteral: (node) => {
        const options = mergeDeep(globalOptions, nodeOptions?.typeLiteral);
        runRule({
          node,
          options,
          context,
          sourceCode,
        });
      },
    };
    return ruleListener;
  },
};

export default rule;
