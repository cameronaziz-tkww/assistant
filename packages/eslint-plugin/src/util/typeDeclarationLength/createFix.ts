import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import type { PropertyNamesOnly } from '../../types';
import getStartingColumn from '../getStartingColumn';
import * as helpers from './helpers';
import * as Types from './types';

interface HandleConfig {
  afterToken: TSESTree.Token;
  beforeToken: TSESTree.Token;
  delimiter: Types.Delimiter;
  isFirst: boolean;
  isLast: boolean;
  fixer: TSESLint.RuleFixer;
  fixes: TSESLint.RuleFix[];
  indentDepth: number;
  leadingIndent: string;
  preventLinebreak?: boolean;
  type: TSESTree.TypeNode;
  startLine: number;
}

type Direction = 'before' | 'after' ;

const removeSpaces = (config: HandleConfig, ignoreValue?: boolean, direction?: Direction) => {
  const { type, afterToken, beforeToken, fixer, fixes, delimiter } = config;
  const start = direction === 'before' ? beforeToken.range[1] : type.range[1];
  const end = direction === 'before' ? type.range[0] : afterToken.range[0];
  const value = direction === 'before' ? beforeToken.value : afterToken.value;
  const isMatch = ignoreValue ? true : value === delimiter;

  if (start !== end && isMatch) {
    fixes.push(fixer.removeRange([start, end]));
  }
};

export const handleTuples = (config: HandleConfig) => {
  const {
    afterToken,
    beforeToken,
    isLast,
    fixer,
    fixes,
    preventLinebreak,
    type,
  } = config;

  removeSpaces(config, true);

  const replacement = replacementText(config, [';']);
  fixes.push(fixer.replaceTextRange(
    [beforeToken.range[1], type.range[0]],
    replacement.text,
  ));

  if (preventLinebreak && !isLast) {
    fixes.push(fixer.insertTextAfter(
      afterToken,
      ' ',
    ));
  }

  if (isLast) {
    fixes.push(fixer.insertTextBefore(
      afterToken,
      preventLinebreak ? '' : `,\n${replacement.baseIndent}`,
    ));
  }
};

const replacementText = (config: HandleConfig, value: string[]) => {
  const {
    afterToken,
    delimiter,
    indentDepth,
    isFirst,
    leadingIndent,
    preventLinebreak,
  } = config;
  const afterValueMatch = value.includes(afterToken.value);
  const lineBeak = !afterValueMatch ? '\n' : '';
  const baseIndent = leadingIndent.slice(indentDepth);
  const indent = afterValueMatch ? '' : leadingIndent;

  const before = helpers.addBefore(delimiter);
  const firstDelimiter = isFirst ? before : '';

  return {
    text: preventLinebreak ? '' : `${lineBeak}${indent}`,
    indent,
    baseIndent,
    firstDelimiter,
  };
};

export const handleUnionsAndIntersections = (config: HandleConfig) => {
  const {
    afterToken,
    beforeToken,
    delimiter,
    fixer,
    fixes,
    indentDepth,
    isFirst,
    preventLinebreak,
    type,
  } = config;

  removeSpaces(config);

  const {
    firstDelimiter,
    indent,
    text,
  } = replacementText(config, [';', '>']);

  if (isFirst && beforeToken.value !== delimiter) {
    const firstText = preventLinebreak ? ' ' : `${text}${firstDelimiter}`;
    fixes.push(fixer.replaceTextRange(
      [beforeToken.range[1], type.range[0]],
      firstText,
    ));
  }

  if (isFirst && beforeToken.value === delimiter && beforeToken.loc.start.column !== indentDepth) {
    fixes.push(fixer.insertTextBefore(
      beforeToken,
      indent,
    ));
  }

  fixes.push(fixer.insertTextBefore(afterToken, text));

  if (preventLinebreak) {
    fixes.push(fixer.insertTextAfter(type, ' '));
  }

  // if (isLast && afterToken.value !== ';') {
  //   fixes.push(fixer.insertTextAfter(type, preventLinebreak ? ' ' : `\n${replacement.baseIndent}`));
  // }
};

const createFix = <
    T extends TSESTree.Node,
    U extends PropertyNamesOnly<T>,
  >(
    sourceCode: Readonly<TSESLint.SourceCode>,
    config: Types.FixConfig<T, U>,
  ) => {
  const {
    node,
    noFix,
    typeKey,
    data,
    options:
    {
      indentWith,
      indentDepth,
    },
    preventLinebreak,
  } = config;

  const fix: TSESLint.ReportFixFunction = (fixer) => {
    const fixes: TSESLint.RuleFix[] = [];
    if (noFix) {
      return fixes;
    }
    const delimiter = helpers.getDelimiter(data.declarationType);
    const isMultiline = node.loc.start.line !== node.loc.end.line;

    const { column } = getStartingColumn(sourceCode, node);
    const length = column + indentDepth;
    const leadingIndent = Array
      .from({ length })
      .map(() => helpers.getIndent(indentWith))
      .join('');
    const types = node[typeKey] as TSESTree.TypeNode[];
    types
      .forEach((type, index) => {

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

        if (beforeToken && afterToken) {
          const handleConfig: HandleConfig = {
            afterToken,
            beforeToken,
            delimiter,
            isFirst: index === 0,
            isLast: index === types.length - 1,
            fixer,
            fixes,
            leadingIndent,
            indentDepth,
            type,
            preventLinebreak: !isMultiline && preventLinebreak,
            startLine: node.loc.start.line,
          };
          if (delimiter === ',') {
            handleTuples(handleConfig);
            return;
          }
          handleUnionsAndIntersections(handleConfig);
        }
      });
    return fixes;
  };
  return fix;
};

export default createFix;
