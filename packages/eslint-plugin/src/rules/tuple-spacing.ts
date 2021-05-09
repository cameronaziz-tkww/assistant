import { TSESLint, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import type { JSONSchema4 } from 'json-schema';
import { allMessages, MessageIds, getMessageId } from '../util/messages';
import { mergeOptions } from '../util/options';
import findParent from '../util/findParent';

const messages = allMessages['tuple-spacing'];

type IndentWith = 'tabs' | 'spaces';

interface Options {
  indentWith: IndentWith;
  indentDepth: number;
}

const defaultOptions: Options = {
  indentDepth: 2,
  indentWith: 'spaces',
};

const schema: JSONSchema4[] = [
  {
    type: 'object',
    properties: {
      indentWith: {
        enum: [
          'tabs',
          'spaces',
        ],
      },
      indentDepth: {
        type: 'integer',
      },
    },
    additionalProperties: false,
  },
];

const meta: TSESLint.RuleMetaData<MessageIds<'tuple-spacing'>> = {
  type: 'suggestion',
  fixable: 'whitespace',
  messages,
  schema,
};

interface FixSpacingConfig {
  fixer: TSESLint.RuleFixer;
  distance: number;
  node: TSESTree.Node | TSESTree.Token;
  after?: boolean;
  leadingText?: string;
}

const rule: TSESLint.RuleModule<MessageIds<'tuple-spacing'>, [Options]> = {
  meta,
  create(context) {
    const sourceCode = context.getSourceCode();

    const [{
      indentDepth,
      indentWith,
    }] = mergeOptions([defaultOptions], context.options);
    const indentText = indentWith === 'spaces' ? ' ' : '\t';

    const fixSpacing = (config: FixSpacingConfig) => {
      const {
        fixer,
        distance,
        node,
        after,
        leadingText,
      } = config;

      if (distance > 0 || after) {
        const end = after ? node.range[1] - distance : node.range[0];
        const start = after ? node.range[1] : end - distance;

        return fixer.replaceTextRange([start, end], leadingText || '');
      }

      const insertText = Array
        .from({ length: distance * -1 })
        .map(() => indentText)
        .join('');
      return fixer.insertTextBefore(node, `${leadingText || ''}${insertText}`);
    };

    const linesArray = (startLine: number, length: number) =>
      Array
        .from({ length })
        .map((_, index) => startLine + index);

    interface EmptyLineGapsResult {
      commentLines: Set<number>;
      lines: number;
      meaningfulEndLoc: TSESTree.LineAndColumnData;
      meaningfulEndRange: number;
    }

    const emptyLineGaps = (
      comments: TSESTree.Comment[],
      beforeNodeOrToken: TSESTree.Node | TSESTree.Token,
      afterNodeOrToken: TSESTree.Node | TSESTree.Token,
    ): EmptyLineGapsResult => {
      const { loc: { end: { line: beforeEndLine, column: beforeEndColumn } }, range: [, beforeEndRange] } = beforeNodeOrToken;
      const { start: { line: afterStartLine }, end: { line: afterEndLine } } = afterNodeOrToken.loc;
      const lines = afterStartLine - beforeEndLine - 1;

      const commentLines = new Set<number>();
      let meaningfulEndRange = beforeEndRange;

      if (lines <= 0) {
        return {
          commentLines,
          lines,
          meaningfulEndRange,
          meaningfulEndLoc: {
            line: afterEndLine + lines + 1,
            column: lines === 0 ? beforeEndColumn + 1 : 0,
          },
        };
      }

      comments.forEach(
        (comment) => {
          const { loc: { start: { line: startLine }, end: { line: endLine } }, range: [, endRange] } = comment;
          const length = endLine - startLine + 1;
          linesArray(startLine, length)
            .forEach((line) => {
              commentLines.add(line);
              meaningfulEndRange = Math.max(meaningfulEndRange, endRange);
            });
        }
      );

      const meaningfulEndLine = commentLines.size > 0 ? Math.max(...[...commentLines]) : beforeEndLine;

      return {
        commentLines,
        meaningfulEndLoc: {
          line: meaningfulEndLine + 1,
          column: 0,
        },
        meaningfulEndRange,
        lines: linesArray(beforeEndLine, afterStartLine - beforeEndLine - 1)
          .reduce(
            (acc, cur) => {
              if (!commentLines.has(cur)) {
                acc += 1;
              }
              return acc;
            },
            0,
          ),
      };
    };

    const getExpectedIndent = (previousNode: TSESTree.Node, index: number) => {
      if (index === 0) {
        return previousNode.loc.start.column + indentDepth;
      }
      return previousNode.loc.start.column;
    };

    const checkBefore = (
      token: TSESTree.Token | null,
      node: TSESTree.Node,
      allNodes: TSESTree.Node[]
    ) => {
      if (!token) {
        return;
      }

      const { range } = node;
      const commentsBefore = sourceCode.getCommentsBefore(node);
      const { meaningfulEndLoc, meaningfulEndRange } = emptyLineGaps(commentsBefore, token, node);
      const currentIndex = allNodes.findIndex((allNode) => allNode === node);
      const previousNode = currentIndex === 0
        ? findParent<TSESTree.TSTypeAliasDeclaration>(node, AST_NODE_TYPES.TSTypeAliasDeclaration)
        : allNodes[currentIndex - 1];

      if (!previousNode) {
        return;
      }

      const expectedIndent = getExpectedIndent(previousNode, currentIndex);

      // Too Many Breaks
      if (meaningfulEndLoc.line < node.loc.start.line) {
        context.report({
          node,
          loc: {
            start: meaningfulEndLoc,
            end: node.loc.end,
          },
          messageId: getMessageId('tooManyBreaks', context),
          fix: (fixer) => {

            const insertText = Array
              .from({ length: expectedIndent })
              .map(() => indentText)
              .join('');

            return fixer.replaceTextRange([meaningfulEndRange, range[0]], `\n${insertText}`);
          },
        });
        return;
      }

      // Is same line
      if (token.loc.end.line === node.loc.start.line) {
        const distance = range[0] - token.range[1] - 1;
        if (token.range[1] !== range[0] - 1) {
          context.report({
            node,
            loc: {
              start: token.loc.start,
              end: node.loc.end,
            },
            messageId: getMessageId('leadingSpacing', context),
            fix: (fixer) => fixSpacing({
              fixer,
              distance,
              node,
            }),
          });
        }
        return;
      }

      // Is next line
      const { column: nodeStart } = node.loc.start;
      if (expectedIndent !== nodeStart) {
        const distance = nodeStart - expectedIndent;
        context.report({
          node,
          loc: {
            start: {
              line: node.loc.start.line,
              column: distance > 0
                ? previousNode.loc.start.column
                : node.loc.start.column,
            },
            end: node.loc.end,
          },
          messageId: getMessageId('indentWrong', context),
          fix: (fixer) => fixSpacing({
            fixer,
            distance,
            node,
          }),
        });
      }
    };

    const reportNotNext = (token: TSESTree.Token, node: TSESTree.Node) => {
      if (token.range[0] !== node.range[1]) {
        const distance = node.range[1] - token.range[0];

        context.report({
          node,
          loc: {
            start: node.loc.start,
            end: token.loc.end,
          },
          messageId: getMessageId('trailingSpacing', context),
          fix: (fixer) => fixSpacing({
            fixer,
            distance,
            node,
            after: true,
          }),
        });
      }
    };

    const checkAfter = (
      token: TSESTree.Token | null,
      node: TSESTree.Node,
      allNodes: TSESTree.Node[],
    ) => {
      if (!token) {
        return;
      }

      const {
        loc: {
          start: {
            line: nodeStartLine,
          },
        },
      } = node;

      const currentIndex = allNodes.findIndex((allNode) => allNode === node);
      const isLast = currentIndex === allNodes.length - 1;
      const parent = findParent<TSESTree.TSTypeAliasDeclaration>(node, AST_NODE_TYPES.TSTypeAliasDeclaration);

      if (isLast && parent) {
        const { loc: { start: parentStart, end: parentEnd } } = parent;
        const sameLine = parentEnd.line === nodeStartLine;
        const trailingComma = token.value === ',';

        // If same line or trailing comma, treat as normal
        if (sameLine || trailingComma) {
          reportNotNext(token, node);

          // If same line exit
          if (sameLine) {
            return;
          }
        }

        const baseNode: TSESTree.Node | TSESTree.Token = trailingComma ? token : node;
        const { loc: { end: { line: baseLine } }, range: [, baseEnd] } = baseNode;
        const finalToken = trailingComma ? sourceCode.getTokenAfter(token) : token;

        // Should never fail
        if (!finalToken) {
          return;
        }

        const { loc: { start: { column: finalStartCol, line: finalStartLine }, end: finalLocEnd }, range: [finalStart] } = finalToken;

        if (
          parentStart.column !== finalStartCol
          || node.loc.end.line !== finalStartLine - 1
        ) {
          const indent = Array
            .from({ length: parentStart.column })
            .map(() => indentText)
            .join('');
          const distance = baseEnd - finalStart;
          context.report({
            node,
            loc: {
              start: {
                line: baseLine + 1,
                column: 0,
              },
              end: finalLocEnd,
            },
            messageId: getMessageId('trailingSpacing', context),
            fix: (fixer) => fixSpacing({
              fixer,
              distance,
              node,
              after: true,
              leadingText: `\n${indent}`,
            }),
          });
        }
        return;
      }

      reportNotNext(token, node);
    };

    return {
      TSTupleType: (node) => {
        const { elementTypes } = node;

        elementTypes.forEach((elementType) => {
          const beforeToken = sourceCode.getTokenBefore(elementType);
          checkBefore(beforeToken, elementType, elementTypes);

          const afterToken = sourceCode.getTokenAfter(elementType);
          checkAfter(afterToken, elementType, elementTypes);
        });
      },
    };
  },
};

export default rule;
