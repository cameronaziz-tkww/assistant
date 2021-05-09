import type { TSESLint } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../typeguards';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';
import determineShouldRun from '../util/determineShouldRun';
import { allMessages, getMessageId, MessageIds } from '../util/messages';

const messages = allMessages['redux-action-creator-filenames'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-action-creator-filenames'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-action-creator-filenames'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns:'actionCreatorDefinitions',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const { moduleNameRaw } = shouldRun;

    const ruleListener: TSESLint.RuleListener = {
      Program: (node) => {

        if (node.body.length !== 1) {
          context.report({
            node,
            messageId: getMessageId('onlyOneDeclaration', context),
            data: {
              memberCount: node.body.length,
            },
          });
        }

        const moduleDeclaration = node.body[0];
        if (!typeguards.isTSModuleDeclaration(moduleDeclaration)) {
          context.report({
            node: moduleDeclaration,
            messageId: getMessageId('shouldDeclare', context),
          });
          return;
        }

        const { id } = moduleDeclaration;
        if (!typeguards.isIdentifierNotLiteral(id)) {
          context.report({
            node: id,
            messageId: getMessageId('notIdentifier', context),
          });
          return;
        }

        const checkFirstLetter = moduleNameRaw[0] !== id.name[0]
          && moduleNameRaw[0].toUpperCase() === id.name[0]
          && moduleNameRaw[0] === id.name[0].toLowerCase();
        const checkRest = moduleNameRaw.slice(1) === id.name.slice(1);

        if (!checkFirstLetter || !checkRest) {
          context.report({
            node: id,
            messageId: getMessageId('incorrectFilename', context),
            data: {
              namespace: id.name,
              moduleFolder: moduleNameRaw,
            },
          });
        }
      },
    };

    return ruleListener;
  },
};

export default rule;
