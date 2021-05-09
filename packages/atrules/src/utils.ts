import { QueryWrapper, ValueType } from 'query-ast';
import { StylesheetNodeType } from 'scss-parser'

export const getAtValueRules = <T extends {}>(clientWrapper: QueryWrapper<StylesheetNodeType, T>):  QueryWrapper<StylesheetNodeType, T> =>
  clientWrapper.find('atrule')
    .has(({ node }) => node.type === 'atkeyword' && node.value === 'value');


export const getDirtyNoParentheses = <T extends {}>(currentAtRule: QueryWrapper<StylesheetNodeType, T>): QueryWrapper<ValueType, T> => {
  const currentChildren = currentAtRule.children();
  const atIndex = currentAtRule
    .find(({ node }) => node.type === 'atkeyword')
    .index();
  const variables = currentChildren
    .eq(atIndex)
    .nextAll()
    .filter(({ node }) =>
    // Filter `from`
    node.value !== 'from' &&
    // Filter import statement
    node.type !== 'string_single' && node.type !== 'string_double' &&
    // Filter last semicolon
    !(node.type === 'punctuation' && node.value === ';')
    ) as QueryWrapper<ValueType, T> ;
  return variables;
};

export const getDirtyVariables = <U extends {}>(currentAtRule: QueryWrapper<StylesheetNodeType, U>, onlyIdentifiers?: boolean): QueryWrapper<ValueType, U> => {
  const hasParentheses = currentAtRule.has('parentheses')
    .length() > 0;

  const hasParenthesesVariables = currentAtRule
    .find('parentheses')
    .children<ValueType>()

  const searchWrapper = hasParentheses ?
      hasParenthesesVariables :
      getDirtyNoParentheses(currentAtRule);

  return onlyIdentifiers ? searchWrapper.filter('identifier') : searchWrapper;
};