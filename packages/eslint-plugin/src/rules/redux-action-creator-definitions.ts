import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import * as typeguards from '../typeguards';
import type { Options } from '../types';
import selectId from '../util/selectId';
import determineShouldRun from '../util/determineShouldRun';
import typePropertyMatch from '../util/report/typePropertyMatch';
import { BASE_RULE_SCHEMA } from '../util/constants';

type ActionCreatorNode = TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration;

interface ActionType {
  name: string;
  node?: ActionCreatorNode;
  correctTypeValue: boolean
}

const messages = allMessages['redux-action-creator-definitions'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-action-creator-definitions'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-action-creator-definitions'>, Options.BaseRule> = {
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

    const { moduleNameRaw } = shouldRun;

    let actionTypes = {
      interfaceDeclarations: [] as ActionType[],
      typeAliasDeclaration: [] as ActionType[],
    };

    const ruleListener: TSESLint.RuleListener = {
      'Program:exit': () => {
        actionTypes = {
          interfaceDeclarations: [],
          typeAliasDeclaration: [],
        };
      },
      TSModuleDeclaration: (node) => {
        // Only working on ActionCreators
        if (
          !typeguards.isIdentifierNotLiteral(node.id)
          || node.id.name !== 'ActionCreators'
          || !node.body
        ) {
          return;
        }

        const { body: childrenNodes } = node.body;

        // Ensure all exported
        const exportedMembers = childrenNodes
          .map((childrenNode) => {
            if (typeguards.isExportNamedDeclaration(childrenNode)) {
              return childrenNode;
            }
            const label = selectId(childrenNode);
            context.report({
              node: label,
              messageId: getMessageId('nonExportedMember', context),
            });
            return null;
          })
          .filter(
            (childrenNode): childrenNode is TSESTree.ExportNamedDeclaration =>
              childrenNode !== null,
          );

        if (exportedMembers.length === 0) {
          context.report({
            node: node.id,
            messageId: getMessageId('noExports', context),
          });
          return;
        }

        exportedMembers.forEach((exportedMember) => {
          if (!exportedMember.declaration) {
            return;
          }

          const { declaration } = exportedMember;
          if (typeguards.isTSInterfaceDeclaration(declaration)) {
            const { name } = declaration.id;
            actionTypes.interfaceDeclarations.push({
              name,
              correctTypeValue: false,
            });
            return;
          }

          if (typeguards.isTSTypeAliasDeclaration(declaration)) {
            const { name } = declaration.id;
            actionTypes.typeAliasDeclaration.push({
              name,
              correctTypeValue: false,
            });
            return;
          }

          // Should not be exporting anything but TypeAlias or Interface
          context.report({
            node: selectId(exportedMember),
            messageId: getMessageId('noExports', context),
          });
        });

      },
      TSInterfaceDeclaration: (node) => {
        const actionType = actionTypes.interfaceDeclarations
          .find((interfaceDeclaration) => interfaceDeclaration.name === node.id.name);

        if (!actionType) {
          return;
        }
        actionType.node = node;

        typePropertyMatch({
          node,
          context,
          properties: node.body.body,
          moduleName: moduleNameRaw,
        });
      },
    };

    return ruleListener;
  },
};

export default rule;
