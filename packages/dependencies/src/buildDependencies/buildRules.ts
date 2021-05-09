import { utils as atrulesUtils } from '@tkww-assistant/atrules';
import { constants, accessors } from '@tkww-assistant/utils';
import query, { JSONNode, JSONNodeValue, ValueType } from 'query-ast';
import { parse, StylesheetNodeType } from 'scss-parser';
import { SchemaNodeType } from '..';
import getAdditionalConversions from './getAdditionalConversions';

const caseInsensitiveTypes: ValueType[] = [
  'color_hex',
];

const buildRules = (fileContents: string): JSONNode<SchemaNodeType> => {
  const fileNode = parse<StylesheetNodeType>(fileContents);
  const astQuery = query<StylesheetNodeType>(fileNode);
  const atRules = atrulesUtils.getAtValueRules(astQuery())

  const rules: JSONNode<SchemaNodeType> = {
    type: 'rules',
    value: [],
  };

  for (let i = 0; i < atRules.length(); i += 1) {
    const rule = atRules.eq(i);
    const firstIdentifier = rule
      .find('identifier')
      .first();
    const rest = firstIdentifier
      .nextAll()
      .filter((node) => node.node.type !== 'punctuation');

    const isOnlyIdentifier = rest.filter((node) => node.node.type !== 'identifier' && node.node.type !== 'space').length() === 0;
    let isCaseInsensitive = false;

    const fromRuleValues: JSONNodeValue<SchemaNodeType> = rest.map((from) => {
      const { type, value } = from.toJSON() as JSONNode<ValueType>;
      if (caseInsensitiveTypes.includes(type)) {
        isCaseInsensitive = true;
      }

      const currentRule: JSONNode<ValueType> = {
        type: type,
        value: value,
      };

      return currentRule;
    });

    const fromRule: JSONNode<SchemaNodeType> = {
      type: 'from',
      value: fromRuleValues,
    };

    const valueNode: JSONNodeValue<SchemaNodeType> = [
      constants.nodes.space,
      {
        type: 'identifier',
        value: accessors.camelCase(firstIdentifier.value()),
      },
    ]

    const valueRule: JSONNode<SchemaNodeType> = {
      type: 'value',
      value: valueNode,
    };


    const settings: JSONNode<SchemaNodeType> = {
      type: 'settings',
      value: [
        {
          type: 'is_case_insensitive',
          value: `${isCaseInsensitive}`,
        },
        {
          type: 'do_not_convert',
          value: `${isOnlyIdentifier}`,
        }
      ],
    };

    const currentRule: JSONNode<SchemaNodeType> = {
      type: 'rule',
      value: [
        valueRule,
        fromRule,
        settings,
      ],
    };

    if (Array.isArray(rules.value)) {
      rules.value.push(currentRule);
    }
  }

  const finalRules = getAdditionalConversions(rules);
  return finalRules;
};

export default buildRules;
