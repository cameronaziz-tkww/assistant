import { QueryWrapper } from 'query-ast';
import { SCSSNode, StylesheetNodeType } from 'scss-parser';
import { Payload } from '.';

const threeToSix = (hex: string) => `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;

const matchNodes = <T extends string, U extends object>(
  tempNodes: QueryWrapper<StylesheetNodeType, SCSSNode>[],
  validRules: QueryWrapper<T, U>,
  matches: Payload.Match<T, U>[]
) => {
  if (tempNodes[0]) {
    let node = tempNodes.shift() as QueryWrapper<StylesheetNodeType, SCSSNode>;
    tempNodes.map((tempNode) => {
      node = node?.concat(tempNode);
    });
    const value = node?.value() || '' ;
    for (let k = 0; k < validRules.length(); k += 1) {
      const currentMaybeMatch = validRules.eq(k);
      const fromNode = currentMaybeMatch
        .find('from' as T);
      const isCaseInsensitive = currentMaybeMatch
        .find('is_case_insensitive' as T)
        .value();
      const formattedValue = isCaseInsensitive === 'true' ? value.toUpperCase() : value;
      const formattedCurrentValue = formattedValue.length === 3 && fromNode.has('color_hex' as T)
        .length() > 0 ? threeToSix(formattedValue) : formattedValue;
      if (
        formattedCurrentValue.trim() ===
        fromNode
          .value()
          .trim()) {
        matches.push({
          source: node,
          change: currentMaybeMatch.find('value' as T),
        });
      }
    }
  }
}


/**
 * Match
 *
 * @param {QueryWrapper<StylesheetNodeType, SCSSNode>} sourceWrapper
 * @param {QueryWrapper<T>} lookupWrapper
 * @return {Payload.Match[]}
 */
const matchNodeValue = <T extends string, U extends object>(
  clientWrapper: QueryWrapper<StylesheetNodeType, SCSSNode>,
  dependencyRules: QueryWrapper<T, U>,
): Payload.Match<T, U>[] => {
  const matches: Payload.Match<T, U>[] = [];
  const values = clientWrapper
    .find('value');
  const validRules = dependencyRules
    .has(({ node }) => node.type === 'do_not_convert' && node.value !== 'true');

  for (let i = 0; i < values.length(); i += 1) {
    const sourceNode = values.eq(i);
    const sourceValues = sourceNode
      .children()
      .filter(({ node }) => node.type !== 'operator' && !(node.type === 'identifier' && node.value === 'important'))

    let tempNodes: QueryWrapper<StylesheetNodeType, SCSSNode>[] = []
    for (let j = 0; j < sourceValues.length(); j +=1 ) {
      const currentNode = sourceValues.eq(j);
      if (currentNode.filter(({ node }) => node.type === 'space').length() === 0) {
        tempNodes.push(currentNode);
        continue;
      }

      matchNodes(tempNodes, validRules, matches);
      tempNodes = [];
    }
    if (tempNodes.length > 0) {
      matchNodes(tempNodes, validRules, matches);
    }
  }
  return matches;
};


export default matchNodeValue;
