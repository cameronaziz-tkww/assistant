import { constants } from '@tkww-assistant/utils';
import { StylesheetNodeType } from 'scss-parser';
import { QueryWrapper, ValueType } from 'query-ast';
import getImportLocation from './getImportLocation';
import newRule from './newRule';
import { getDirtyVariables, getAtValueRules } from './utils';

const changeRule = (variables: QueryWrapper<ValueType>, change: QueryWrapper<ValueType>) => {
  const found = variables.find((item) => item.node.value === change.get(0).value);

  if (found.length() === 0) {
    // The variables include an extra space
    const firstChild = variables.first()
    const identifier = change.find('identifier').get(0);
    firstChild.before(constants.nodes.space);
    firstChild.before(identifier);
    firstChild.before(constants.nodes.comma);
  }
};

const update = (
  clientWrapper: QueryWrapper<StylesheetNodeType>,
  change: QueryWrapper<ValueType>
) => {
  const importLocation = getImportLocation(change);

  const currentRule = getAtValueRules(clientWrapper)
    .has((rule) => rule.node.type === 'string_double' || rule.node.type === 'string_single')
    .has((rule) => rule.node.value === importLocation);

  if (currentRule.length() === 0) {
    const newAtRule = newRule(importLocation, change);
    const topLine = clientWrapper
      .children()
      .eq(0)
      .before(newAtRule);

    const topLineIsRule = topLine
      .filter(({ node }) => node.type === 'rule')
      .length() > 0;

      if (topLineIsRule) {
        topLine.before(constants.nodes.newLine)
      }
  } else {
    const variables = getDirtyVariables(currentRule)
    const isAlreadyImported = variables
      .has(({ node }) => node.value === change.value().trim()).length() > 0
    if (!isAlreadyImported) {
      changeRule(variables, change);
    }
  }
};

export default update;
