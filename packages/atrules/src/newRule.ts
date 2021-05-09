import { constants } from '@tkww-assistant/utils';
import { Node, QueryWrapper, ValueType } from 'query-ast';
import { StylesheetNodeType, SCSSNode } from 'scss-parser';

const newRule = <T extends ValueType, U extends object>(
  dependencyName: string,
  change: QueryWrapper<T, U>
): Node<StylesheetNodeType> => {
  const identifier: Node<ValueType> = {
    type: 'identifier',
    value: change.value().trim()
  }
  const variables: Node<ValueType>[] = [
    constants.nodes.space,
    identifier,
    constants.nodes.space,
  ];

  const parentheses = {
    type: 'parentheses',
    value: variables,
  }

  const newAtRule = {
    type: 'atrule',
    value: [
      constants.nodes.atKeyword,
      constants.nodes.space,
      parentheses,
      constants.nodes.space,
      constants.nodes.fromNode,
      constants.nodes.space,
      {
        type: 'string_single',
        value: dependencyName,
      },
      constants.nodes.semicolon,
      constants.nodes.newLine,
    ],
  };

  return newAtRule as Node<StylesheetNodeType, SCSSNode>;
};

export default newRule;
