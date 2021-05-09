import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds } from '../util/messages';
import * as typeguards from '../typeguards';
import typePropertyMatch from '../util/report/typePropertyMatch';
import determineShouldRun from '../util/determineShouldRun';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-action-creator-type'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-action-creator-type'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-action-creator-type'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'actionCreators',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile) {
      return {};
    }

    const { moduleNameRaw } = shouldRun;

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

          // Ensure type property is set up correctly
          if (
            typeguards.isIdentifier(declaration.id)
            && typeguards.isObjectExpression(declaration.init.body)
          ) {
            typePropertyMatch({
              context,
              moduleName: moduleNameRaw,
              properties: declaration.init.body.properties,
              node: declaration,
            });
          }
        });
      },
    };

    return ruleListener;
  },
};

export default rule;
