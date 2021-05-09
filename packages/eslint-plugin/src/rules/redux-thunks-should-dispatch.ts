import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import determineShouldRun from '../util/determineShouldRun';
import * as typeguards from '../typeguards';
import { GLOBAL_SCHEMA_OPTION, RULE_SCHEMA_OPTION } from '../util/constants';
import { Options, ReturnStatement, ExportDeclarationKind } from '../types';
import { mergeOptions } from '../util/options';
import findVariable from '../util/findVariable';
import analyzeExportDeclaration from '../util/analyzeExportDeclaration';

interface RuleConfig {
  allowPassingDispatch: boolean;
  allowReassignment: boolean;
}

type RuleOptions = Options.AddGlobalSchema<[RuleConfig, Options.RuleSchema]>;

const messages = allMessages['redux-thunks-should-dispatch'];

const defaultOptions: RuleConfig = {
  allowPassingDispatch: false,
  allowReassignment: false,
};

const schema = [
  {
    type: 'object',
    properties: {
      allowPassingDispatch: {
        type: 'boolean',
      },
      allowReassignment: {
        type: 'boolean',
      },
    },
    additionalProperties: false,
  },
  RULE_SCHEMA_OPTION,
  GLOBAL_SCHEMA_OPTION,
];

const meta: TSESLint.RuleMetaData<MessageIds<'redux-thunks-should-dispatch'>> = {
  type: 'suggestion',
  messages,
  schema,
};

const rule: TSESLint.RuleModule<MessageIds<'redux-thunks-should-dispatch'>, RuleOptions> = {
  meta,
  create(context) {
    const shouldRun = determineShouldRun({
      context,
      globPatterns: 'thunksDispatch',
      consumerOptions: context.options[1],
    });

    if (!shouldRun || !shouldRun.isMatchedFile || shouldRun.fileExtension !== 'ts') {
      return {};
    }

    const [{
      allowPassingDispatch,
      allowReassignment,
    }] = mergeOptions([defaultOptions, {}], context.options);

    let declarations: ReturnStatement[] = [];

    const addDeclaration = (declaration: ReturnStatement | null) => {
      if (!declaration) {
        return;
      }

      const [dispatchAssignment] = declaration.parameters;

      // Ensure parameter is passed to function
      if (!dispatchAssignment) {
        context.report({
          node: declaration.node,
          messageId: getMessageId('noDispatchParameter', context),
        });
        return;
      }

      declarations.push(declaration);
    };

    const findDeclaration = <T extends TSESTree.BaseNode>(node: T, inside?: boolean) => {
      const lessThan = inside ? 1 : 0;
      const greaterThan = inside ? 0 : 1;
      return declarations.find(
        ({ node: { range } }) =>
          range[lessThan] <= node.range[lessThan]
          && range[greaterThan] >= node.range[greaterThan],
      );
    };

    const ruleListener: TSESLint.RuleListener = {
      'Program:exit': () => {
        declarations = [];
      },
      'ExportNamedDeclaration:exit': (node: TSESTree.ExportNamedDeclaration) => {
        const storedDeclaration = findDeclaration(node, true);
        const globalScope = context.getScope();

        if (!storedDeclaration) {
          return;
        }

        const {
          parameters: [
            {
              name: dispatchParameterName,
              node: dispatchParameterNode,
            },
          ],
        } = storedDeclaration;

        if (dispatchParameterName) {
          const dispatchReference = findVariable(globalScope, dispatchParameterNode);

          if (dispatchReference) {
            const { references } = dispatchReference;

            // Dispatch never even used
            if (references.length === 0) {
              context.report({
                node: dispatchParameterNode,
                messageId: getMessageId('dispatchNotCalled', context),
                data: {
                  parameterName: dispatchParameterName,
                },
              });
              return;
            }

            // Check if was called
            const wasCalled = references
              .some((reference) => typeguards.isCallExpression(reference.identifier.parent));

            if (!wasCalled) {
              context.report({
                node,
                messageId: getMessageId('dispatchNotCalled', context),
                data: {
                  parameterName: dispatchParameterName,
                },
              });
            }

            // Check if was used outside of being called
            if (!allowReassignment) {
              const otherUsage = references
                .some((reference) => !typeguards.isCallExpression(reference.identifier.parent));
              if (otherUsage) {
                context.report({
                  node,
                  messageId: getMessageId('dispatchReassigned', context),
                });
              }
            }
          }
        }
      },
      ExportNamedDeclaration: (node) => {
        const result = analyzeExportDeclaration(node.declaration);
        if (!result) {
          return;
        }

        if (result.declarationKind === ExportDeclarationKind.Arrow) {
          result.declarationWrappers.forEach((declaration) => {
            addDeclaration(declaration);
          });
          return;
        }

        addDeclaration(result.declarationWrapper);
      },
      CallExpression: (node) => {
        // Check option
        if (!allowPassingDispatch) {
          return;
        }

        // Should always be false, but still
        if (!node.parent) {
          return;
        }

        const declaration = findDeclaration(node);

        // Outside of a declaration or the declaration has already dispatched
        if (!declaration) {
          return;
        }

        const {
          parameters: [dispatchAssignment],
        } = declaration;

        // If an identifier, it will be parent, if a member expression, it will be grandparent
        const expressionStatement = typeguards
          .isMemberExpression(node.parent) ? node.parent.parent : node.parent;

        if (
          expressionStatement
          && typeguards.isExpressionStatement(expressionStatement)
          && typeguards.isCallExpression(expressionStatement.expression)
        ) {
          const { expression: callExpression } = expressionStatement;

          // Check if dispatch assignment was passed as param
          const passedDispatch = callExpression.arguments.find((argument) =>
            typeguards.isIdentifier(argument)
            && argument.name === dispatchAssignment.name,
          );

          if (passedDispatch) {
            context.report({
              node: passedDispatch,
              messageId: getMessageId('dispatchUsedAsParameter', context),
            });
          }
        }
      },
    };
    return ruleListener;
  },
};

export default rule;
