import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import * as typeguards from '../typeguards';
import * as NodeHelperTypes from '../types/NodeHelperTypes';
import determineShouldRun from '../util/determineShouldRun';
import type { Options } from '../types';
import { BASE_RULE_SCHEMA } from '../util/constants';

const messages = allMessages['redux-namespace-members'];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-namespace-members'>> = {
  type: 'suggestion',
  messages,
  schema: BASE_RULE_SCHEMA,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-namespace-members'>, Options.BaseRule> = {
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

    const ruleListener: TSESLint.RuleListener = {
      TSModuleDeclaration: (node) => {
        const namespaceId = typeguards.isIdentifier(node.id)
          && node.id.name.toLocaleLowerCase() === moduleNameRaw
          ? node.id
          : null;

        if (!namespaceId) {
          return;
        }

        const isActionTypesNode = <T extends NodeHelperTypes.NodeWithType> (
          maybeActionTypes: T,
        ) => {
          if(
            typeguards.isTSTypeAliasDeclaration(maybeActionTypes)
            && typeguards.isIdentifier(maybeActionTypes.id)
            && maybeActionTypes.id.name === 'ActionTypes'
          ) {
            return {
              node: maybeActionTypes,
              id: maybeActionTypes.id,
            };
          }
          return null;
        };

        const isActionCreatorsNode = <T extends NodeHelperTypes.NodeWithType> (
          maybeActionCreators: T,
        ) => {
          if(
            typeguards.isTSModuleDeclaration(maybeActionCreators)
            && typeguards.isIdentifier(maybeActionCreators.id)
            && maybeActionCreators.id.name === 'ActionCreators'
          ) {
            return {
              node: maybeActionCreators,
              id: maybeActionCreators.id,
            };
          }
          return null;
        };

        const ensureUnion = (
          maybeActionTypes?: TSESTree.TSTypeAliasDeclaration,
        ) => {
          if (
            typeguards.isDefined(maybeActionTypes)
          ) {
            const { typeAnnotation, id } = maybeActionTypes;

            // Check if a union
            if (!typeguards.isTSUnionType(typeAnnotation)) {
              context.report({
                node: id,
                messageId: getMessageId('notUnion', context),
              });
            }
          }
        };

        const analyzeNamed = (named: TSESTree.ProgramStatement, shouldFind: boolean) => {
          // Named is ActionCreators and not exported
          const maybeActionCreatorNode = isActionCreatorsNode(named);
          const actionCreatorNode = shouldFind ? null : maybeActionCreatorNode;

          // Named is exported ActionCreator
          if (shouldFind && maybeActionCreatorNode) {
            return maybeActionCreatorNode.id.name;
          }

          // Named is ActionCreator not exported
          if (actionCreatorNode) {
            context.report({
              node: actionCreatorNode.id,
              messageId: getMessageId('notExported', context),
              data: {
                exportName: 'ActionCreators',
                exportType: 'namespace',
              },
            });
            return null;
          }

          const maybeActionTypesNode = isActionTypesNode(named);
          const actionTypesNode = shouldFind ? null : maybeActionTypesNode;

          // Named is exported ActionTypes
          if (shouldFind && maybeActionTypesNode) {
            ensureUnion(maybeActionTypesNode.node);
            return maybeActionTypesNode.id.name;
          }

          // Named is ActionTypes not exported
          if(actionTypesNode) {
            context.report({
              node: actionTypesNode.id,
              messageId: getMessageId('notExported', context),
              data: {
                exportName: 'ActionTypes',
                exportType: 'type',
              },
            });
            return null;
          }

          // Named is extra exported member
          if(shouldFind) {
            if (
              typeguards.hasId(named)
              && named.id
              && typeguards.isIdentifier(named.id))
            {
              context.report({
                node: named.id,
                messageId: getMessageId('extraExport', context),
                data: {
                  module: namespaceId.name,
                  member: named.id.name,
                },
              });
              return null;
            }
            context.report({
              node: named,
              messageId: getMessageId('extraExportUnknown', context),
              data: {
                module: namespaceId.name,
              },
            });
            return null;
          }

          if (
            typeguards.hasId(named)
            && named.id
            && typeguards.isIdentifier(named.id))
          {
            context.report({
              node: named.id,
              messageId: getMessageId('extraDefinition', context),
              data: {
                module: namespaceId.name,
                member: named.id.name,
              },
            });
            return null;
          }
          context.report({
            node: named,
            messageId: getMessageId('extraDefinitionUnknown', context),
            data: {
              module: namespaceId.name,
            },
          });
          return null;
        };

        if (!node.body) {
          return;
        }

        const found = node.body.body.map((named) => {
          if(
            typeguards.isExportNamedDeclaration(named)
          && typeguards.hasType(named.declaration)
          ) {
            return analyzeNamed(named.declaration, true);
          }
          return analyzeNamed(named, false);
        });
        const requiredExports = ['ActionCreators', 'ActionTypes' ];
        requiredExports.forEach((requiredExport) => {
          if (!found.includes(requiredExport)) {
            context.report({
              node: namespaceId,
              messageId: getMessageId('missingExport', context),
              data: {
                module: namespaceId.name,
                member: requiredExport,
              },
            });
          }
        });
      },
    };

    return ruleListener;
  },
};

export default rule;
