import { TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import { RunTaskConfig, FixConfig } from './types';
import report from './report';
// import getStartingColumn from '../getStartingColumn';
// import findParent from '../findParent';

const getAfter = (
  node: TSESTree.Node,
  afterToken: TSESTree.Token | null,
) => {
  if (!afterToken) {
    const {
      range:
      [
        ,
        afterStart,
      ],
      loc: {
        end: {
          line: afterLine,
        },
      },
    } = node;
    // Its the end of the file
    return {
      afterStart,
      afterLine,
      afterValue: '',
      noAfter: true,
      isOutside: true,
    };
  }

  const {
    range:
    [
      afterStart,
    ],
    loc: {
      end: {
        line: afterLine,
      },
    },
    value: afterValue,
  } = afterToken;

  return {
    afterStart,
    afterLine,
    afterValue,
    noAfter: false,
    isOutside: afterStart > node.range[1],
  };
};

const runConsistentSpacing = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>,
>(config: RunTaskConfig<T, U>): boolean => {
  const {
    context,
    declarationType,
    node,
    typeKey,
    // options: {
    //   indentDepth,
    // },
  } = config;

  const sourceCode = context.getSourceCode();
  const delimiterAfter = declarationType === 'tuple';
  // const startingColumn = getStartingColumn(sourceCode, node);
  // const expectedIndent = indentDepth + startingColumn.column;

  const fixConfig: FixConfig<T, U> = {
    ...config,
    data: {
      declarationType,
    },
    messageId: 'consistentSpacing',
    preventLinebreak: true,
    sourceCode,
  };

  const types = node[typeKey] as TSESTree.TypeNode[];
  // const parent = findParent(node, AST_NODE_TYPES.TSTypeAliasDeclaration);

  const isOneLine = types
    .every((type) => type.loc.start.line === types[0].loc.start.line);
  // console.log('~ isOneLine', isOneLine);

  // console.log('~ node', node);
  // if (!parent) {
  //   return false;
  // }

  // const {
  //   loc: {
  //     start: {
  //       // line: nodeStartLine,
  //       // column: nodeStartColumn,
  //     },
  //     end: {
  //       line:
  //       nodeEndLine,
  //     },
  //   },
  // } = node;

  // const isOneLine = nodeStartLine === nodeEndLine;


  const inConsistentSpacing = types.some(
    (type, index) => {
      const isLast = index === types.length - 1;

      const {
        range: [
          typeStart,
          typeEnd,
        ],
        loc: {
          start: {
            // column: typeColumn,
            line: typeLine,
          },
        },
      } = type;
      const beforeToken = sourceCode.getTokenBefore(
        type,
        {
          includeComments: false,
        },
      );
      const afterToken = sourceCode.getTokenAfter(
        type,
        {
          includeComments: false,
        },
      );

      if (beforeToken) {
        const {
          range:
          [
            ,
            beforeEnd,
          ],
          loc: {
            // start: {
            //   column: beforeStartColumn,
            // },
            // end: {
            //   line: beforeLine,
            // },
          },
          value: beforeValue,
        } = beforeToken;

        const after = getAfter(node, afterToken);
        const {
          afterStart,
          afterLine,
          afterValue,
          isOutside,
        }  = after;

        if (isOneLine) {
          // Ensure to ensure one space before type except leading brackets
          if(typeStart !== beforeEnd + 1 && beforeValue !== '[') {
            return true;
          }

          if (delimiterAfter) {
            // Ensure there are no trailing spaces except trailing brackets
            if(!isOutside && typeEnd !== afterStart && afterValue !== ']') {
              return true;
            }

            return false;
          }

          // Ensure there is no trailing spaces at end
          if (!isOutside && isLast && afterStart !== typeEnd) {
            return true;
          }

          // Ensure there is trailing single space on members
          if (!isOutside && !isLast && afterStart !== typeEnd + 1) {
            return true;
          }

          return false;
        }

        // Ensure no trailing spaces on semicolons
        if (!isOutside && typeEnd !== afterStart && afterValue === ';') {
          return true;
        }

        if (delimiterAfter && !isOutside) {
          // Ensure no trailing spaces on members
          if (typeEnd !== afterStart && !isLast) {
            return true;
          }


          // Ensure one line break on bracket
          if (typeLine !== afterLine + 1 && afterValue === ']') {
            return true;
          }

          // Ensure not on same line as declaration
          // if(typeLine === nodeStartLine && !isOutside) {
          //   return true;
          // }

          // const startColumn = delimiterAfter ? nodeStartColumn : beforeStartColumn;

          // Ensure indent is correct
          // if (startColumn !== expectedIndent) {
          //   return true;
          // }

          // Ensure no space after bracket
        }


        // if (afterNoSpace) {

        //   if(typeEnd !== afterStart && !isOutside) {
        //     return true;
        //   }

        //   if (typeLine === beforeLine) {
        //     if (beforeEnd !== typeStart - 1 && beforeValue !== '[') {
        //       return true;
        //     }

        //     if (beforeEnd !== typeStart && beforeValue === '[') {
        //       return true;
        //     }
        //     return false;
        //   }
        //   if (typeColumn !== expectedIndent) {
        //     return true;
        //   }
        //   return false;
        // }

        // if(typeStart !== beforeEnd + 1) {
        //   return true;
        // }

        // if (typeLine === afterLine) {
        //   console.log('~ typeLine === afterLine', typeLine, afterLine);
        //   if (beforeStart !== expectedIndent) {
        //     console.log('~ beforeStart !== expectedIndent', beforeStart !== expectedIndent);
        //     return true;
        //   }

        //   const isAllowedNext = allowable.ends.includes(afterValue);
        //   if (!isOutside && isAllowedNext && afterStart !== typeEnd) {
        //     return true;
        //   }

        //   if (!isOutside && !isAllowedNext && afterStart !== typeEnd + 1) {
        //     return true;
        //   }
        //   return false;
        // }

        return false;
      }
      return true;
    },
  );

  if (inConsistentSpacing) {
    report(fixConfig);
    return true;
  }

  return false;
};

export default runConsistentSpacing;
