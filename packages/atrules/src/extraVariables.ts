import { typeGuards } from '@tkww-assistant/utils';
import { StylesheetNodeType } from 'scss-parser';
import { QueryWrapper } from 'query-ast';
import { getDirtyVariables, getAtValueRules } from './utils';

const extraVariables = <T extends {}>(clientWrapper: QueryWrapper<StylesheetNodeType, T>) => {
  const atRules = getAtValueRules(clientWrapper)
  const values = clientWrapper
    .find('value')
    .find('identifier')
    .map(({ node: { value } }) => {
      return value;
    });

  const unusedVariables = atRules.map((atRule, index) => {
    const currentAtRule = atRules.eq(index);
    const unusedVarsInRule = getDirtyVariables(currentAtRule, true)
      .filter(({ node }) => {
        if (typeGuards.valueIsString(node.value) && values.includes(node.value)) {
          return false;
        }
        return true;
      });
    return unusedVarsInRule;
  });

  return unusedVariables;
};

export default extraVariables;
