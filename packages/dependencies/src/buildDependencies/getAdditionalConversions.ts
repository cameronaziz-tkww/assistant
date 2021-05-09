import { constants, typeGuards } from '@tkww-assistant/utils';
import query, { JSONNode } from 'query-ast';
import { SchemaNodeType } from '..';

const getAdditionalConversions = (rules: JSONNode<SchemaNodeType>): JSONNode<SchemaNodeType> => {
  const queryRules = query(rules);

  const reduceResults: JSONNode<SchemaNodeType>[] = [];
  const identifiers = Object.keys(constants.identifierConversions);

  const results = queryRules()
    .find('from')
    .find('identifier')
    .has(({ node }) => {
      const { value } = node;
      if (typeGuards.valueIsString(value)) {
        if (identifiers.includes(value)) {
          return true;
        }
      }
      return false;
    })
    .parent()
    .find('number')
    .parents('rule')
    .get()
    .map((node) => {
      const conversions: JSONNode<SchemaNodeType>[] = [];

      const nodeQuery = query<SchemaNodeType>(node);
      const fromValue = nodeQuery()
        .find('from');
      const fromNumber = fromValue
        .find('number')
        .value();
      const fromIdentifier = fromValue
        .find('identifier')
        .value();
      const fromValueNumber = parseFloat(fromNumber);
      const { identifierConversions } = constants;
      const fromFactor = identifierConversions[fromIdentifier];
      for (const conversion in identifierConversions) {
        const conversionFactor = identifierConversions[conversion];
        if (conversion !== fromIdentifier) {
          0.125;
          const newRule = query<SchemaNodeType>(node)()
            .find('from')
            .find('number')
            .replace(() => ({
              type: 'number',
              value: JSON.stringify(fromValueNumber / fromFactor * conversionFactor),
            }))
            .parent()
            .find('identifier')
            .replace(() => ({
              type: 'identifier',
              value: conversion,
            }))
            .parent()
            .parents('rule')
            .get(0);
          conversions.push(newRule);
        }
      }
      return conversions;
    })
    .reduce(
      (acc, cur) =>
        acc.concat(cur),
      reduceResults
    );

  const finalResult = queryRules();

  results.forEach((result) => {
    finalResult
      .children()
      .last()
      .after(result);
  });

  return finalResult.get(0);
};

export default getAdditionalConversions;
