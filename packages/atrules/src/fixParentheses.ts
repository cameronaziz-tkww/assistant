import { constants } from '@tkww-assistant/utils'
import { StylesheetNodeType, SCSSNode } from 'scss-parser'
import { QueryWrapper, Node } from 'query-ast';
import { getAtValueRules } from './utils';

const rebuildVariables = (variables: QueryWrapper<StylesheetNodeType>, atKeywordIndex: number, fromIndex: number) => {
  const tempNodes: Node<StylesheetNodeType, SCSSNode>[] = [constants.nodes.space]
  for (let i = atKeywordIndex + 1; i < fromIndex; i += 1) {
    const currentNode = variables.eq(i);
    const node = currentNode.get(0);
    if (node.type === 'identifier') {
      tempNodes.push(node);
      tempNodes.push(constants.nodes.comma);
      tempNodes.push(constants.nodes.space);
    }
    currentNode.remove();
  }
  tempNodes.splice(tempNodes.length - 2, 1);
  return tempNodes;
}

const fixParentheses = (client: QueryWrapper<StylesheetNodeType>) => {
  try {

  const atRules = getAtValueRules(client)
  for (let i = 0; i < atRules.length(); i += 1) {
    const atRule = atRules.eq(i);

    // Ensure no double spaces.
    atRule
      .find('space')
      .replace(() => constants.nodes.space)

    // If parentheses, exit
    if (atRule.find('parentheses').length()) {
      const parentheses = atRule.find('parentheses');
      const variables = parentheses.children()
      atRule
        .find('parentheses')
        .replace(() => ({
          type: 'parentheses',
          value: rebuildVariables(variables, 0, variables.length())
        }))
      continue;
    }
    // if (typeGuards.wrapperIsValueNodes(children)) {
      // Get the index of the `@value` and the `from`


      // Iterate through the children starting at the first node after the `@value` until the node before the `from`.
      // Add the JSON to tempNodes and remove from the QueryWrapper.
      // const tempNodes: Node<StylesheetNodeType, SCSSNode>[] = [constants.nodes.space]
      // for (let i = atKeywordIndex + 1; i < fromIndex; i += 1) {
      //   const currentNode = children.eq(i);
      //   const node = currentNode.get(0);
      //   if (node.type === 'identifier') {
      //     tempNodes.push(node);
      //     tempNodes.push(constants.nodes.comma);
      //     tempNodes.push(constants.nodes.space);
      //   }
      //   currentNode.remove();
      // }

      const children = atRule.children();
      const atKeywordIndex = children
          .find(({ node }) => node.type === 'atkeyword' && node.value === 'value')
          .index();
      const fromIndex = children
        .find(({ node }) => node.type === 'identifier' && node.value === 'from')
        .index();

      // Build the parentheses and add the tempNodes as children.
      const parenthesesNode: Node<StylesheetNodeType, SCSSNode> = {
        type: 'parentheses',
        value: rebuildVariables(children, atKeywordIndex, fromIndex),
      }

      // Add it back to the main QueryWrapper.
      children
        .eq(fromIndex)
        .before(parenthesesNode);

      atRule
        .find('parentheses')
        .children()
        .filter(({ node }) => node.type === 'punctuation' && node.value === ',')
        .last()
        .remove()

      // Ensure that the parentheses is wrapped by spaces.
      const newChildren = atRule
        .children();
      const newFromIndex = newChildren
        .find(({ node }) => node.type === 'identifier' && node.value === 'from')
        .index();
      const beforeNode = newChildren
        .eq(atKeywordIndex + 1);
      const isSpaceBefore = beforeNode
        .filter('space')
        .length() > 0;
      const afterNode = newChildren
        .eq(newFromIndex - 1);
      const isSpaceAfter = afterNode
        .filter('space')
        .length() > 0;


      if (!isSpaceBefore) {
        beforeNode.before(constants.nodes.space);
      }

      if (!isSpaceAfter) {
        afterNode.after(constants.nodes.space);
      }

      continue;
    }
  } catch (error) {
    console.log(error)
  }

    // The code should never have gotten here
    // errors.reportError('An issue arose when attempting to fix the parentheses.');
  // }
}

export default fixParentheses;
