import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { mergeOptions } from '../util/options';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import type { Delimiter, BaseToken, Message } from '../types';

interface RuleOptions {
  delimiter: Delimiter
}

const defaultOptions: RuleOptions = {
  delimiter: 'semi',
};

const messages = allMessages['type-delimiter-style'];

const schema = [
  {
    type: 'object',
    properties: {
      delimiter: {
        enum: [
          'none',
          'semi',
          'comma',
        ],
      },
    },
    additionalProperties: false,
  },
];

export const getValue = (lastToken: BaseToken | null): Delimiter => {
  const value = lastToken?.value;
  switch(value) {
    case ',':
      return 'comma';
    case ';':
      return 'semi';
    default:
      return 'none';
  }
};

export const getMessage = (
  opts: RuleOptions,
  value: Delimiter
): Message<'type-delimiter-style'> => {
  if (opts.delimiter === value) {
    return { missingDelimiter: false };
  }

  switch(opts.delimiter) {
    case 'none': {
      return value === 'semi'
        ? {
          messageId: 'unexpectedSemi',
          missingDelimiter: true,
        }
        : {
          messageId: 'unexpectedComma',
          missingDelimiter: true,
        };
    }
    case 'comma': {
      return value === 'semi'
        ? {
          messageId: 'unexpectedSemi',
          missingDelimiter: false,
        }
        : {
          messageId: 'expectedComma',
          missingDelimiter: true,
        };
    }
    case 'semi': {
      return value === 'comma'
        ? {
          messageId: 'unexpectedComma',
          missingDelimiter: false,
        }
        : {
          messageId: 'expectedSemi',
          missingDelimiter: true,
        };
    }
    default: return { missingDelimiter: false };
  }
};

const meta: TSESLint.RuleMetaData<MessageIds<'type-delimiter-style'>> = {
  type: 'suggestion',
  fixable: 'code',
  messages,
  schema,
};

const rule: TSESLint.RuleModule<MessageIds<'type-delimiter-style'>, [RuleOptions]> = {
  meta,
  create(context) {
    const sourceCode = context.getSourceCode();
    const [options] = mergeOptions([defaultOptions], context.options);

    const ruleListener: TSESLint.RuleListener = {
      TSTypeAliasDeclaration: (node) => {
        const lastToken = sourceCode.getLastToken(
          node,
          {
            includeComments: false,
          },
        );
        const value = getValue(lastToken);
        const message = getMessage(options, value);
        if (message.messageId && lastToken) {
          context.report({
            node: lastToken,
            loc: {
              start: {
                line: lastToken.loc.end.line,
                column: lastToken.loc.end.column,
              },
              end: {
                line: lastToken.loc.end.line,
                column: lastToken.loc.end.column,
              },
            },
            messageId: getMessageId(message.messageId, context),
            fix(fixer) {
              if (options.delimiter === 'none') {
                return fixer.remove(lastToken);
              }

              const token = options.delimiter === 'semi' ? ';' : ',';

              if (message.missingDelimiter) {
                return fixer.insertTextAfter(lastToken, token);
              }

              return fixer.replaceText(lastToken, token);
            },
          });
        }
      },
    };

    return ruleListener;
  },
};

export default rule;
