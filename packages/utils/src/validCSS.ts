import { QueryWrapper, JSONNode, ValueType } from 'query-ast';
import cssPropertyValues from './cssPropertyValues';

interface Value {
  type: ValueType
  value?: string
}

interface ValueMapping {
  [property: string]: Value[]
}

const valueMapping: ValueMapping = {
  length: [
    {
      type: 'number',
    },
    {
      type: 'identifier',
      value: 'rem',
    },
  ],
  '%': [
    {
      type: 'number',
    },
    {
      type: 'identifier',
      value: '%',
    },
  ],
  color: [
    {
      type: 'color_hex',
    },
  ],
};

type CSSValueType = 'css-values' | 'data-type' | 'name' | 'ast' | ValueType

const valueAST: JSONNode<CSSValueType> = {
  type: 'css-values',
  value: [
    {
      type: 'data-type',
      value: [
        {
          type: 'name',
          value: 'length'
        },
        {
          type: 'ast',
          value: [
            {
              type: 'space',
              value: ' ',
            },
            {
              type: 'number',
              value: 'any'
            },
            {
              type: 'identifier',
              value: 'rem' // Only support `rem`` to filter all other identifiers
            }
          ]
        }
      ]
    },
    {
      type: 'data-type',
      value: [
        {
          type: 'name',
          value: '%'
        },
        {
          type: 'ast',
          value: [
            {
              type: 'space',
              value: ' ',
            },
            {
              type: 'number',
              value: 'any'
            },
            {
              type: 'identifier',
              value: '%'
            }
          ]
        }
      ]
    },
    {
      type: 'data-type',
      value: [
        {
          type: 'name',
          value: 'color'
        },
        {
          type: 'ast',
          value: [
            {
              type: 'space',
              value: ' ',
            },
            {
              type: 'color_hex',
              value: 'any'
            },
          ]
        }
      ]
    }
  ]
};

const cssValues = (property: string) => cssPropertyValues.filter((cssProp) => cssProp.property === property);
const cssValue = (property: string) => {
  const foundProperty = cssPropertyValues.find((cssProp) => cssProp.property === property)
  if (foundProperty?.values) {
    return foundProperty;
  }
};

const isValidProperty = (prop: string) => cssPropertyValues.filter(cssProp => cssProp.property === prop).length > 0;

const isValidPropertyValue = <T extends string>(queryWrapper: QueryWrapper<T>, property: string) => {
  const cssValues = cssPropertyValues.filter((cssProp) => cssProp.property === property);
  return cssValues
    .map((cssValue) => {
      const { values } = cssValue;
      if (!values) {
        return [false];
      }
      return values
        .map((value) => {
          const valueMap = valueMapping[value];
          if (valueMap) {
            const hasTypes = valueMap
              .map((page) => {
                return queryWrapper
                  .has(page.type as T)
                  .length() > 0
              }
              )
              .every((has) => {
                return has === true;
              });
            const hasValues = valueMap
              .map((page) => {
                if (!page.value) {
                  return true;
                }
                const ok = queryWrapper
                  .has(({ node }) => node.value === page.value);
                return ok.length() > 0;

              })
              .every((has) => has === true);
            return hasTypes && hasValues;
          }
        })
        .some((value) => value === true);
    })
    .some((value) => value === true);;

};

export default {
  cssPropertyValues,
  cssValues,
  isValidProperty,
  isValidPropertyValue,
  cssValue,
  valueAST,
};
