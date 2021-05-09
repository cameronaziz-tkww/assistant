import { QueryWrapper, Node } from 'query-ast';
import { StylesheetNodeType } from 'scss-parser';

const filter = (value: QueryWrapper<StylesheetNodeType>): QueryWrapper<StylesheetNodeType> =>
  value
    .children()
    .filter(({ node }) => node.type !== 'operator' || node.value !== '!')
    .filter(({ node }) => node.type !== 'identifier' || node.value !== 'important')


const hasImportant = (value: QueryWrapper<StylesheetNodeType>): boolean =>
  value
    .has(({ node }) => node.type === 'operator' && node.value === '!')
    .has(({ node }) => node.type === 'identifier' && node.value === 'important')
    .length() > 0

const isImportantNode = (node: Node<string>) =>
  (node.type === 'operator' && node.value === '!') || (node.type === 'identifier' && node.value === 'important')

export default {
  filter,
  hasImportant,
  isImportantNode,
};