import { QueryWrapper } from 'query-ast';

const getNoParentheses = <T extends string, U extends {}>(
  currentAtRule: QueryWrapper<T, U>
): QueryWrapper<T, U> => {
  const currentChildren = currentAtRule.children();
  const atIndex = currentAtRule
    .find(({ node }) => node.type === 'atkeyword')
    .index();
  const variables = currentChildren
    .eq(atIndex)
    .nextAll()
    .filter(({ node }) => node.value !== 'from' && node.type !== 'string_single' && node.type !== 'string_double');
  return variables;
};

export const getDirtyVariables = <T extends string, U extends {}>(
  currentAtRule: QueryWrapper<T, U>,
  onlyIdentifiers?: boolean
): QueryWrapper<T, U> => {
  const hasParentheses = currentAtRule.has('parentheses' as T)
    .length() > 0;

  const searchWrapper = hasParentheses ?
    currentAtRule
      .find('parentheses' as T)
      .children() as QueryWrapper<T, U> :
    getNoParentheses(currentAtRule as QueryWrapper<T, U>);

  return onlyIdentifiers ? searchWrapper.filter('identifier' as T) : searchWrapper;
};

export default getDirtyVariables;
