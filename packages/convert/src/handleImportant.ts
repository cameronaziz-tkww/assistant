import { important, constants } from '@tkww-assistant/utils';
import query, { QueryWrapper, ValueType, Node } from 'query-ast';
import { Payload } from '.';

const handleImportant = (match: Payload.Match<ValueType, Node>): QueryWrapper<ValueType, Node> => {
  const { source, change } = match;
  const node = change.get(0);
  const changeWrapper = query(node)();

  // Check if the source has an `!important!` tag.
  const hasImportant = important.hasImportant(source)
  if (hasImportant) {

    // Ensure there is a space.
    const lastChild = changeWrapper
      .children()
      .last();
    if (lastChild.get(0).type !== 'space') {
      lastChild.after(constants.nodes.space);
    }

    const important: Node<ValueType> = {
      type: 'identifier',
      value: 'important'
    };

    const operator: Node<ValueType> ={
      type: 'operator',
      value: '!',
    };

    // Add the `!important` in reverse order because we are adding them AFTER the the change.
    changeWrapper
      .children()
      .last()
      .after(important)
      .after(operator);
  }

  return changeWrapper;
}

export default handleImportant;