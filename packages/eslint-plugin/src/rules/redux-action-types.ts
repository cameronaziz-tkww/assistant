import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import moduleExportedMembers from '../util/moduleExportedMembers';
import * as typeguards from '../typeguards';
import determineShouldRun from '../util/determineShouldRun';
import matchNamespace from '../util/report/matchNamespace';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-action-types'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-action-types'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-action-types'>, Options.BaseRule> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'actionCreatorDefinitions',
      consumerOptions: context.options[0],
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const ruleListener: TSESLint.RuleListener = {
      TSTypeAliasDeclaration: (node) => {
        if (
          !typeguards.isIdentifierNotLiteral(node.id)
          || node.id.name !== 'ActionTypes'
        ) {
          return;
        }

        const exportedActionCreators = moduleExportedMembers(node, 'ActionCreators');
        const actionCreatorNames = exportedActionCreators
          .map(
            (exportedActionCreator) => {
              if (
                typeguards.hasId(exportedActionCreator)
                && exportedActionCreator.id
                && typeguards.isIdentifier(exportedActionCreator.id)
              ) {
                return exportedActionCreator.id.name;
              }
              return null;
            },
          )
          .filter((name): name is string => name !== null);

        const { typeAnnotation } = node;
        if (!typeguards.isTSUnionType(typeAnnotation)) {
          return;
        }

        const actionTypeNames = typeAnnotation.types
          .map((type) => {
            if (!typeguards.isTSTypeReference(type)) {
              context.report({
                node: type,
                messageId: getMessageId('nonTypeReference', context),
              });
              return null;
            }

            const result = matchNamespace(
              {
                node: type,
                context,
                expectedNamespace: 'ActionCreators',
              },
            );

            const { node: { right: member }, name } = result;

            // No Action Creator
            if (!actionCreatorNames.includes(member.name)) {
              context.report({
                node: type,
                messageId: getMessageId('missingActionCreator', context),
                data: {
                  member: name,
                },
              });
              return null;
            }

            return member.name;
          });

        exportedActionCreators
          .forEach(
            (exportedActionCreator) => {
              if (
                typeguards.hasId(exportedActionCreator)
                && exportedActionCreator.id
                && typeguards.isIdentifier(exportedActionCreator.id)
                && !actionTypeNames.includes(exportedActionCreator.id.name)
              ) {
                context.report({
                  node: exportedActionCreator.id,
                  messageId: getMessageId('missingActionType', context),
                  data: {
                    member: exportedActionCreator.id.name,
                  },
                });
              }
            },
          );
      },
    };

    return ruleListener;
  },
};

export default rule;
