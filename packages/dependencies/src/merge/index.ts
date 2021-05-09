import query, { QueryWrapper, NewJSONNode } from 'query-ast';
import { SchemaType } from '..';

const baseNode: NewJSONNode<SchemaType> = {
  type: 'dependencies',
  value: [],
};

const getBaseNode = (current?: QueryWrapper<SchemaType>): NewJSONNode<SchemaType> => {
  if (current) {
    return current.get(0);
  }
  return { ...baseNode };
};

const getBase = (current?: QueryWrapper<SchemaType>): QueryWrapper<SchemaType> => {
  const base = getBaseNode(current);
  return query(base)() as QueryWrapper<SchemaType>;
}

const nodes = (values: NewJSONNode<SchemaType>[], current?: NewJSONNode<SchemaType>): QueryWrapper<SchemaType> => {
  const base = current || { ...baseNode };
  if (Array.isArray(base.value)) {
    base.value = [
      ...base.value,
      ...values,
    ];
  }
  return query(base)() as QueryWrapper<SchemaType>;
}

const wrappers = (containers: QueryWrapper<SchemaType>[], current?: QueryWrapper<SchemaType>): QueryWrapper<SchemaType> => {
  const values: NewJSONNode<SchemaType>[] = [];
  containers.forEach((container) => {
    if (container.length() > 0) {
      values.push(container.get(0))
    }
  });
  const base = getBaseNode(current);
  return nodes(values, base);
};

export default {
  getBaseNode,
  getBase,
  wrappers,
  nodes,
};
