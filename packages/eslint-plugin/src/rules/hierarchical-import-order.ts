import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import * as helpers from '../util/hierarchicalImportOrder';
import type * as RuleTypes from '../util/hierarchicalImportOrder/types';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import { mergeOptions } from '../util/options';

const defaultOptions: RuleTypes.RuleConfig = {
  reactAlwaysFirst: true,
  styleAlwaysLast: true,
  ignoreLeadingAt: false,
  ignoreCases: true,
};

const messages = allMessages['hierarchical-import-order'];

const schema = [
  {
    type: 'object',
    properties: {
      reactAlwaysFirst: {
        type: 'boolean',
      },
      styleAlwaysLast: {
        type: 'boolean',
      },
      ignoreLeadingAt: {
        type: 'boolean',
      },
      ignoreCases: {
        type: 'boolean',
      },
    },
    additionalProperties: false,
  },
];

const meta: TSESLint.RuleMetaData<MessageIds<'hierarchical-import-order'>> = {
  type: 'suggestion',
  fixable: 'code',
  messages,
  schema,
};

const rule: TSESLint.RuleModule<MessageIds<'hierarchical-import-order'>, RuleTypes.RuleOptions> = {
  meta,
  create(context) {
    const [options] = mergeOptions([defaultOptions], context.options);
    const sourceCode = context.getSourceCode();

    const ruleListener: TSESLint.RuleListener = {
      Program: (node) => {
        // Find first non import - we dont want to move these
        const firstNonImportIndex = node.body
          .findIndex((bodyNode) => bodyNode.type !== AST_NODE_TYPES.ImportDeclaration);

        interface ImportNode {
          node: TSESTree.ImportDeclaration;
          bodyLocation: number
        }
        // Extract the import declarations
        const imports = node.body
          .map(
            (bodyNode, index) => ({
              node: bodyNode,
              bodyLocation: index,
            }))
          .filter((bodyNode, index): bodyNode is ImportNode =>
            bodyNode.node.type === AST_NODE_TYPES.ImportDeclaration
            && index < firstNonImportIndex,
          );

        const results = imports
          // Map imports to create Specifiers
          .map<RuleTypes.Specifier>((importNode, index) => ({
            text: sourceCode.getText(importNode.node),
            importNode: importNode.node,
            value: importNode.node.source.value,
            currentPlace: index,
            expectedPlace: index,
          }))
          // Sort to expected order
          .sort((a, b) => helpers.compare(a, b, options))
          // Remap to set expectedPlace to index
          .map<RuleTypes.Specifier>((specifier, index) => ({
            ...specifier,
            expectedPlace: index,
          }))
          // Sort back to original order (findMoves needs it this way)
          .sort((a, b) => a.currentPlace < b.currentPlace ? -1 : 1)
          // Add comments back to line
          .map((result) => {
            const { text, importNode } = result;
            const {
              loc: {
                start: {
                  line: nodeStartLine,
                },
                end: {
                  line: nodeEndLine,
                },
              },
            } = importNode;

            const commentsSet = new Set<TSESTree.Comment>();
            const afterComments = sourceCode.getCommentsAfter(importNode);
            const beforeComments = sourceCode.getCommentsBefore(importNode);

            let currentText = text;
            let [currentStart, currentEnd] = importNode.range;

            afterComments.forEach((comment) => {
              if (!commentsSet.has(comment) && comment.loc.start.line === nodeStartLine) {
                const { commentText, extraCharacters, padding } = helpers.commentData(
                  comment,
                  'after',
                  currentEnd,
                );
                commentsSet.add(comment);
                currentText = `${currentText}${padding}${commentText}`;
                currentEnd = comment.range[1] + extraCharacters;
              }
            });

            beforeComments.forEach((comment) => {
              if (!commentsSet.has(comment) && comment.loc.end.line === nodeEndLine) {
                commentsSet.add(comment);
                const { commentText, extraCharacters, padding } = helpers.commentData(
                  comment,
                  'before',
                  currentStart,
                );
                currentText = `${commentText}${padding}${currentText}`;
                currentStart = comment.range[0] - extraCharacters;
              }
            });

            return {
              ...result,
              text: currentText,
            };
          });

        // Find the least amount of moves to fix the statements
        const moves = helpers.findMoves(results);

        const buildFixes = (
          fixer: TSESLint.RuleFixer,
        ): TSESLint.RuleFix[] => {
          const fixes: TSESLint.RuleFix[] = [];
          const text = results
            .slice()
            .sort((a, b) => a.expectedPlace < b.expectedPlace ? -1 : 1)
            .map(
              (result, index) => {
                const lineBreak = index < results.length - 1 ? '\n' : '';
                return `${result.text}${lineBreak}`;
              })
            .reduce(
              (acc, cur) => {
                const currentText = `${acc}${cur}`;
                return currentText;
              },
              '',
            );

          const starting = imports[0].node.range;
          const ending = imports[imports.length - 1].node.range;

          fixes.push(fixer.insertTextAfterRange(ending, text));
          fixes.push(fixer.removeRange([starting[0], ending[1]]));

          return fixes;
        };

        // Report the moves as suggestions
        moves.forEach((move, index) => {
          const { specifier, nextAtDestination } = move;
          const { importNode, value } = specifier;
          const direction = specifier.currentPlace < specifier.expectedPlace ? 'after' : 'before';
          context.report({
            node: importNode,
            messageId: getMessageId(nextAtDestination ? 'shouldMove' : 'atEnd', context),
            data: {
              problemSpecifier: value,
              targetSpecifier: nextAtDestination?.value,
              direction,
            },
            fix: (fixer) => {
              if (index !== 0) {
                return [];
              }
              return buildFixes(fixer);
            },
          });
        });
      },
    };
    return ruleListener;
  },
};

export default rule;
