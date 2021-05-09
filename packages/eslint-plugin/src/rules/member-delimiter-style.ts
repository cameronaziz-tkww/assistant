import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { mergeOptions } from '../util/options';
import { mergeDeep } from '../util/hidash';
import { allMessages, MessageIds } from '../util/messages';
import { Delimiter } from '../types';
import delimiter from '../util/report/delimiter';

interface MultiRuleOption {
  delimiter: Delimiter;
  requireLast: boolean;
}

interface SingleRuleOption {
  delimiter: Exclude<Delimiter, 'none'>;
  requireLast: boolean;
}

interface RuleBaseOptions {
  multiline: MultiRuleOption;
  singleline: SingleRuleOption;
}

interface OverrideOptions {
  typeLiteral: RuleBaseOptions;
  interface: RuleBaseOptions;
};

type GlobalOptionsOnly = [RuleBaseOptions];
type WithOverrideOptions = [RuleBaseOptions, OverrideOptions];
export type RuleOptions = GlobalOptionsOnly | WithOverrideOptions;

type Context = TSESLint.RuleContext<MessageIds<'member-delimiter-style'>, RuleOptions>;

const defaultBaseOptions: RuleBaseOptions = {
  multiline: {
    delimiter: 'semi',
    requireLast: true,
  },
  singleline: {
    delimiter: 'semi',
    requireLast: false,
  },
};

const defaultOptions: RuleOptions = [
  defaultBaseOptions,
];

const messages = allMessages['member-delimiter-style'];

const option = {
  type: 'object',
  properties: {
    delimiter: {
      enum: [
        'none',
        'semi',
        'comma',
      ],
    },
    requireLast: {
      type: 'boolean',
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

const meta: TSESLint.RuleMetaData<MessageIds<'member-delimiter-style'>> = {
  type: 'suggestion',
  fixable: 'code',
  messages,
  schema,
};

interface MemberSeparatorConfig {
  typeElements: TSESTree.TypeElement[];
  options: RuleBaseOptions;
  context: Context;
  sourceCode: Readonly<TSESLint.SourceCode>;
  node: TSESTree.Node;
}

const memberSeparator = (config: MemberSeparatorConfig) => {
  const { typeElements, context, sourceCode, options, node } = config;
  const isSingleLine = node.loc.start.line === node.loc.end.line;
  const option = isSingleLine ? options.singleline : options.multiline;

  typeElements.forEach((member, index) => {
    const token = sourceCode.getLastToken(
      member,
      {
        includeComments: false,
      },
    );
    const isLast = index === typeElements.length - 1;
    delimiter({
      node: member,
      token,
      context,
      isLast,
      option,
    });
  });
};

const rule: TSESLint.RuleModule<MessageIds<'member-delimiter-style'>, RuleOptions> = {
  meta,
  create(context) {
    const [globalOptions, nodeOptions] = mergeOptions(defaultOptions as RuleOptions, context.options);
    const sourceCode = context.getSourceCode();

    const ruleListener: TSESLint.RuleListener = {
      TSInterfaceBody: (node) => {
        const options = mergeDeep(globalOptions, nodeOptions?.interface);
        memberSeparator({
          typeElements: node.body,
          options,
          context,
          node,
          sourceCode,
        });
      },
      TSTypeLiteral: (node) => {
        const options = mergeDeep(globalOptions, nodeOptions?.typeLiteral);
        memberSeparator({
          typeElements: node.members,
          options,
          context,
          node,
          sourceCode,
        });
      },
    };
    return ruleListener;
  },
};

export default rule;
