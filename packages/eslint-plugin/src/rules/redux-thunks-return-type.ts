import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import determineShouldRun from '../util/determineShouldRun';
import * as typeguards from '../typeguards';
import matchNamespace from '../util/report/matchNamespace';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-thunks-return-type'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-thunks-return-type'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-thunks-return-type'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'thunks',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const checkReturnType = <T extends TSESTree.Node>(
      node: T,
      returnType?: TSESTree.TSTypeAnnotation,
    ) => {
      if (returnType) {
        matchNamespace({
          context,
          node: returnType.typeAnnotation,
          expectedNamespace: 'Redux',
        });
        return;
      }
      context.report({
        node,
        messageId: getMessageId('noReturnType', context),
      });
    };

    const ruleListener: TSESLint.RuleListener = {
      ExportNamedDeclaration: (node) => {
        if (!node.declaration) {
          return;
        }

        const { declaration } = node;

        // A classic function
        if (typeguards.isFunctionDeclaration(declaration)) {
          const { body: { body: statements } } = declaration;

          // Iterate over all the statements
          const hasReturn = statements.some((statement) =>
            typeguards.isReturnStatement(statement)
            && typeguards.isFunctionValue(statement.argument),
          );

          if (!hasReturn) {
            context.report({
              node: declaration,
              messageId: getMessageId('returnFunction', context),
            });
          }

          const { returnType } = declaration;
          checkReturnType(declaration, returnType);
          return;
        }

        // An arrow function
        if(typeguards.isVariableDeclaration(declaration)) {
          declaration.declarations.forEach(({ init }) => {
            if (typeguards.isArrowFunctionExpression(init)) {
              checkReturnType(declaration, init.returnType);

              if (!typeguards.isFunctionValue(init.body)) {
                context.report({
                  node: declaration,
                  messageId: getMessageId('returnFunction', context),
                });
              }
            }
          });
        }
      },
    };
    return ruleListener;
  },
};

export default rule;
