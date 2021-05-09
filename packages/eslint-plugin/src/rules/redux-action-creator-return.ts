import type { TSESLint } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../typeguards';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';
import determineShouldRun from '../util/determineShouldRun';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import matchNamespace from '../util/report/matchNamespace';

const messages = allMessages['redux-action-creator-return'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-action-creator-return'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-action-creator-return'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'actionCreators',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const { moduleName } = shouldRun;

    const ruleListener: TSESLint.RuleListener = {
      ExportNamedDeclaration: (node) => {
        if (!node.declaration || !typeguards.isVariableDeclaration(node.declaration)) {
          return;
        }

        node.declaration.declarations.forEach((declaration) => {
          if (
            !declaration.init
            || !typeguards.isArrowFunctionExpression(declaration.init)
          ) {
            return;
          }

          // Ensure return type is setup correctly
          if (!declaration.init.returnType) {
            context.report({
              node: declaration,
              messageId: getMessageId('missingReturnType', context),
            });
            return;
          }

          const { typeAnnotation } = declaration.init.returnType;

          matchNamespace(
            {
              context,
              node: typeAnnotation,
              expectedNamespace: moduleName,
            },
            true,
          );
        });
      },
    };

    return ruleListener;
  },
};

export default rule;
