import { utils } from '@tkww-assistant/atrules';
import { getImports } from '@tkww-assistant/dependencies';
import { QueryWrapper } from 'query-ast';
import { StylesheetNodeType } from 'scss-parser';

const removeUnused = <T extends string>(
  clientWrapper: QueryWrapper<StylesheetNodeType>,
  dependencies: QueryWrapper<T, any>
) => {
  // Get each identifier used in a value
  const values = clientWrapper
    .find('rule')
    .find('block')
    .find('declaration')
    .find('value')
    .find('identifier');

  const dependencyImports = getImports(dependencies as QueryWrapper<any>);

  // Get each atrule and iterate over
  const atRules = utils.getAtValueRules(clientWrapper)
    .has(({ node }) => !!dependencyImports.find(({ dependencyImport }) => dependencyImport === node.value))

  atRules.map((_, index) => {
    const currentAtRule = atRules.eq(index);
    const variables = utils.getDirtyVariables(currentAtRule)

    // Iterate over each child, filter identifiers, check if identifier in values QueryWrapper, if not, return true and remove.
    variables
      .find((variable) => {
        if (variable.node.type === 'identifier') {
          const found = values
          .has((valueIdentifier) => variable.node.value === valueIdentifier.node.value);
          if (found.length() === 0) {
            return true;
          }
        }
        return false;
      })
      .remove()
      .parents('atrule');

    const newVariables = utils.getDirtyVariables(currentAtRule, true)

    // Get the variables for the rule, if none, remove it.
    if (newVariables.find('identifier').length() === 0) {
      currentAtRule.remove();
    }
  });

  // Get the new last atRule.
  const lastAtRule = utils.getAtValueRules(clientWrapper).last();

  // Get the last child node of the atRule
  const lastAtRuleChildren = lastAtRule
    .children()
    .last();

  // If it is a space, or new line, remove it.
  // We will ensure to add a new line outside of the node later.
  const spaceFollowing = lastAtRuleChildren
    .filter(({ node }) => node.type === 'space');

  if (spaceFollowing.length() > 0) {
    lastAtRuleChildren.remove();
  }

  // Doing manual work on the children, we will have to find various positions that need work.
  const children = clientWrapper
    .children();

  const spaceIndexes = children
    .map(({ node }) => node.type === 'space');
  const firstRuleIndex = children
    .map(({ node }) => node.type === 'rule')
    .indexOf(true);

  // Remove double spaces
  for (let i = 0; i < firstRuleIndex; i += 1) {
    const isSpace = spaceIndexes[i];
    const nextIsSpace = spaceIndexes[i + 1];
    if (isSpace && nextIsSpace) {
      children
        .eq(i)
        .remove();
    }
  }
};

export default removeUnused;
