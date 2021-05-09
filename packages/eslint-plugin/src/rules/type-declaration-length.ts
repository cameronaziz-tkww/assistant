import type { JSONSchema4 } from 'json-schema';
import type { TSESLint } from '@typescript-eslint/experimental-utils';
import applyDefaultOptions from '../util/applyDefaultOptions';
import { allMessages } from '../util/messages';
import * as utils from '../util/typeDeclarationLength';
import * as Types from '../util/typeDeclarationLength/types';

const { DECLARATION_TYPES } = utils;
const messages = allMessages['type-declaration-length'];

export const baseDefaultOptions: Types.BaseOptions = {
  alwaysBreak: false,
  maxLength: 100,
  breakOneBreakAll: true,
  consistentBreaks: true,
};

export const globalOptions: Types.GlobalOptions = {
  indentDepth: 2,
  indentWith: 'spaces',
};

export const defaultOptions: Types.Options = {
  ...globalOptions,
  ...DECLARATION_TYPES.reduce(
    (result, item) => {
      result[item] = {
        ...baseDefaultOptions,
        enabled: true,
      };
      return result;
    },
    {} as Types.Options,
  ),
};

const wrap = (properties: Record<string, JSONSchema4>): JSONSchema4 => ({
  type: 'object',
  properties,
  additionalProperties: false,
});

const baseSchema: Record<string, JSONSchema4> = {
  alwaysBreak: {
    oneOf: [
      {
        type: 'boolean',
      },
      {
        type: 'integer',
        minimum: 2,
      },
    ],
  },
  maxLength: {
    type: 'number',
  },
  breakOneBreakAll: {
    type: 'boolean',
  },
  consistentBreaks: {
    type: 'boolean',
  },
};

const typesAsObjects: Record<string, JSONSchema4> = {
  ...baseSchema,
  ...DECLARATION_TYPES.reduce(
    (result, item) => {
      result[item] = wrap(baseSchema);
      return result;
    },
    {},
  ),
  types: {
    type: 'array',
    items: [
      {
        enum: DECLARATION_TYPES,
      },
    ],
  },
};

export const schema: JSONSchema4[] = [
  wrap(typesAsObjects),
];

const meta: TSESLint.RuleMetaData<Types.MessageIds> = {
  type: 'suggestion',
  fixable: 'whitespace',
  messages,
  schema,
};

const rule: TSESLint.RuleModule<Types.MessageIds, [Types.Options]> = {
  meta,
  create(context) {
    const contextOptions = context.options[0] as unknown as Types.ContextOptions;
    const options = applyDefaultOptions(DECLARATION_TYPES, defaultOptions, contextOptions);

    const ruleListener: TSESLint.RuleListener = {
      TSUnionType: (node) => {
        utils.run({
          context,
          declarationType: 'union',
          node,
          options,
          typeKey: 'types',
        });
      },
      TSIntersectionType: (node) => {
        utils.run({
          context,
          declarationType: 'intersection',
          node,
          options,
          typeKey: 'types',
        });
      },
      TSTupleType: (node) => {
        utils.run({
          options,
          context,
          node,
          declarationType: 'tuple',
          typeKey: 'elementTypes',
        });
      },
    };

    return ruleListener;
  },
};

export default rule;
