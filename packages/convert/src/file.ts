import { update, fixParentheses } from '@tkww-assistant/atrules';
import { parse, StylesheetNodeType, SCSSNode, stringify } from 'scss-parser';
import query, { Node, JSONNode, QueryWrapper, ValueType } from 'query-ast';
import handleImportant from './handleImportant';
import matchNodeValue from './matchNodeValue';
import removeUnused from './removeUnused';

const file = (text: string, dependenciesNode: Node<any, any>) => {
  const nodeFile = parse<StylesheetNodeType>(text);

  const queryFile = query<StylesheetNodeType, SCSSNode>(nodeFile);

  const queryDependencies = query(dependenciesNode);
  const dependencies = queryDependencies();

  const client = queryFile();

  const rule = dependencies.find('rule' as ValueType);
  const matches = matchNodeValue(client, rule as QueryWrapper<ValueType, any>);

  matches.forEach((match) => {
    const change = handleImportant(match);
    const { source } = match;

    if (source.length() > 1) {
      for (let i = 1; i < source.length(); i += 1) {
        source.eq(i)
          .remove();
      }
    }

    const fixedChange = change
      .children()
      .filter(({ node }) => node.type !== 'space')
      .get() as Node<StylesheetNodeType>[];

    const value: JSONNode<StylesheetNodeType> = {
      type: 'value',
      value: fixedChange,
    };

    const modified = source
      .replace(() => value)
      .parents('stylesheet');

    // We need to send the original match to get the parents.
    update(modified, match.change as QueryWrapper<ValueType>);
  });

  // Fix import statements
  removeUnused(client, dependencies);
  fixParentheses(client);

  const newCSS = stringify(client.get(0));

  return newCSS;
};

export default file;
