import type { TSESLint } from '@typescript-eslint/experimental-utils';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';
import determineShouldRun from '../util/determineShouldRun';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import selectId from '../util/selectId';

const messages = allMessages['redux-thunks-no-default-export'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-thunks-no-default-export'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-thunks-no-default-export'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'thunksDispatch',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile) {
      return {};
    }

    const ruleListener: TSESLint.RuleListener = {
      ExportDefaultDeclaration: (node) => {
        context.report({
          node: selectId(node),
          messageId: getMessageId('noDefaultExport', context),
        });

      },
    };
    return ruleListener;
  },
};

export default rule;
