import { update } from '@tkww-assistant/atrules';
import { Payload } from '.';
import { ValueType, Node } from 'query-ast';
import handleImportant from './handleImportant';

const convertValue = (match: Payload.Match<ValueType, Node>) => {
  const { source, change } = match;

  // We will may be modifying so we want a new `change` QueryWrapper
  const changeWrapper = handleImportant(match);

  if (source.length() > 1) {
    for (let i = 1; i < source.length(); i += 1) {
      source.eq(i).remove();
    }
  }

  // Get the new variable added
  const newValue = source
    .replace(() =>
      changeWrapper
      .filter(({ node }) => node.type !== 'space')
      .get(0))
    .parent()
    .find('value')
    .children()
    .filter(({ node }) => node.value === change.value().trim())

  // Delete all nodes before
  newValue
    .prevAll()
    .remove()

  // Add one space and return the entire sheet.
  const modified = newValue
    // .before(constants.nodes.space)
    .parents('stylesheet');

  // Update the @value ru;e
  update(modified, change);
}

export default convertValue;
