import { JSONSchema4 } from 'json-schema';

const schemaTypes = [
  'string',
  'number',
  'boolean',
  'object',
  'integer',
  'array',
];

const enumTypes = [
  'string',
  'boolean',
];

interface OfArray {
  array: JSONSchema4[]
  property: 'oneOf' | 'anyOf' | 'allOf'
}

const additionalArrayProperties = {
  minLength: 'number',
};

const findOf = (item: JSONSchema4): OfArray | null => {
  const { oneOf, anyOf, allOf } = item;
  if (oneOf) {
    return {
      property: 'oneOf',
      array: oneOf,
    };
  }
  if (anyOf) {
    return {
      property: 'anyOf',
      array: anyOf,
    };
  }
  if (allOf) {
    return {
      property: 'allOf',
      array: allOf,
    };
  }
  return null;
};

const runOf = (node: JSONSchema4, of: OfArray, rule: string, root: JSONSchema4) => {
  const { property, array } = of;
  const isArray = Array.isArray(array);
  if (!isArray) {
    console.log(
      `node.${property} is incorrect in rule ${rule}\n`,
      `expected array and received ${typeof array}\n\n`,
      node,
      root,
    );
  }
  expect(isArray)
    .toEqual(true);
  for (const itemProperty in node) {
    if (itemProperty !== property) {
      const additional = additionalArrayProperties[itemProperty];
      if (additional) {
        const isCorrectType = typeof node[itemProperty] === additional;
        if (!isCorrectType) {
          console.log(
            `incorrect type found in ${itemProperty} in rule ${rule}\n`,
            `expected ${additional} and received ${typeof node[itemProperty]}\n\n`,
            node,
            root,
          );
        }
        expect(isCorrectType)
          .toEqual(true);
        return;
      }
      console.log(
        `additional property found in node in rule ${rule}\n`,
        `expected only node.${property} and received node.${itemProperty}\n\n`,
        node,
        root,
      );
      expect(true)
        .toEqual(false);
    }
  }
  array.forEach((ofItem) => {
    runSchema(ofItem, rule, root);
  });
};

const runObject = (node: JSONSchema4, rule: string, root: JSONSchema4) => {
  const { properties, additionalProperties, additionalItems, uniqueItems } = node;
  runBoolean(additionalProperties, rule, root);
  runBoolean(uniqueItems, rule, root);
  runShouldNotExist(additionalItems, rule, root);

  for(const property in properties) {
    const value = properties[property];
    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && !isArray;
    if (!isObject) {
      console.log(
        `object property is incorrect in rule ${rule}\n`,
        `expected object and received ${
          isArray ? 'array' : typeof value
        }\n\n`,
        node,
        root,
      );
    }
    expect(isObject)
      .toBe(true);
    runSchema(value, rule, root);
  }
};

const runBoolean = (node: boolean | JSONSchema4 | undefined, rule: string, root: JSONSchema4) => {
  if (!node) {
    return;
  }
  const addItemsIsBool = typeof node === 'boolean';
  if (!addItemsIsBool) {
    console.log(
      `node is incorrect in rule ${rule}\n`,
      `expected boolean and received ${typeof node}\n\n`,
      node,
      root,
    );
  }
  expect(addItemsIsBool)
    .toEqual(true);
};

const runShouldNotExist = (node: boolean | JSONSchema4 | undefined, rule: string, root: JSONSchema4) => {
  if (!node) {
    return;
  }
  console.log(
    `node is incorrect in rule ${rule}\n`,
    `expected not defined and received ${node}\n\n`,
    node,
    root,
  );

  expect(true)
    .toEqual(false);
};

const runArray = (node: JSONSchema4, rule: string, root: JSONSchema4) => {
  const { items, additionalItems, additionalProperties ,uniqueItems } = node;
  runBoolean(additionalItems, rule, root);
  runBoolean(uniqueItems, rule, root);
  runShouldNotExist(additionalProperties, rule, root);

  if (items) {
    if (Array.isArray(items)) {
      for(const item in items) {
        runSchema(items[item], rule, root);
      }
      return;
    }
    runSchema(items, rule, root);
  }
};

const runRef = (node: JSONSchema4, rule: string, root: JSONSchema4) => {
  const { $ref } = node;
  const refs = $ref.split('/');
  const base = refs.shift();
  const startsWithPound = base === '#';
  if (!startsWithPound) {
    console.log(
      `node is reference is wrong in rule ${rule}\n`,
      `expected to start with # and received ${$ref}\n\n`,
      node,
      root,
    );
  }
  expect(startsWithPound)
    .toEqual(true);

  let position = root;
  while (refs.length > 0) {
    const location = refs.shift();
    position = position[location];
  }

  runSchema(position, rule, root);
};

const runSchema = (node: JSONSchema4, rule: string, root?: JSONSchema4) => {
  const { type, $ref } = node;
  const rootNode = root || node;

  if (Array.isArray(type)) {
    console.log(
      `type is incorrect in rule ${rule}\n`,
      `expected one of ${schemaTypes} and received an array\n\n`,
      node,
      rootNode,
    );
    expect(true)
      .toEqual(false);
    return;
  }

  if (node.enum) {
    const isArray = Array.isArray(node.enum);
    if (!isArray) {
      console.log(
        `enum is incorrect in rule ${rule}\n`,
        `expected array and received ${typeof node.enum}\n\n`,
        node,
        rootNode,
      );
    }
    expect(isArray)
      .toEqual(true);

    node.enum.forEach((value) => {
      if (!enumTypes.includes(typeof value)) {
        console.log(
          `enum value is incorrect in rule ${rule}\n`,
          `expected one of ${enumTypes} and received ${typeof value}\n\n`,
          node,
          rootNode,
        );
        expect(true)
          .toEqual(false);
      }
    });
    return;
  }

  const of = findOf(node);

  if (of) {
    runOf(node, of, rule, rootNode);
    return;
  }

  if ($ref) {
    runRef(node, rule, rootNode);
    return;
  }

  const includesType = schemaTypes.includes(type);
  if (!includesType) {
    console.log(
      `node.type is incorrect in rule ${rule}\n`,
      `expected one of ${schemaTypes} and received ${type}\n\n`,
      node,
      rootNode,
    );
  }
  expect(includesType)
    .toEqual(true);

  if (typeof node.default !== 'undefined') {
    const defaultIsArray = Array.isArray(node.default);
    const arrayOK = defaultIsArray && type === 'array';
    const defaultIsCorrect =
      typeof node.default === type
      || arrayOK;
    if (!defaultIsCorrect) {
      console.log(
        `default is incorrect in rule ${rule}\n`,
        `expected ${type} and received ${
          defaultIsArray ? 'array' : typeof node.default
        }\n\n`,
        node,
        rootNode,
      );
    }
    expect(defaultIsCorrect)
      .toEqual(true);
  }

  if (type === 'object') {
    runObject(node, rule, rootNode);
  }

  if (type === 'array') {
    runArray(node, rule, rootNode);
  }
};

export const advancedCheck = (node: JSONSchema4, rule: string) => {
  const { definitions, ...rest } = node;
  runSchema(rest, rule, node);

  for (const definition in definitions) {
    runSchema(definitions[definition], rule, node);
  }
};

export default runSchema;
