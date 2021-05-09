import { QueryWrapper, NodeWrapper, Node } from 'query-ast';

const hasType = <T extends string, U extends object = {}>(queryWrapper: QueryWrapper<T, U>, hasArray: T[], index: number = 0): QueryWrapper<T, U> => {
  if (index >= hasArray.length) {
    return queryWrapper;
  }

  const has = hasArray[index];
  if (has === 'space') {
    return hasType(queryWrapper, hasArray, index + 1);
  }

  const newQueryWrapper = queryWrapper.has(has);
  return hasType(newQueryWrapper, hasArray, index + 1);
};

interface HasChildValueParameters<T extends string> {
  queryWrapper: QueryWrapper<T>
  hasArray: NodeWrapper<T>[]
  excludedValues?: any[]
  excludedTypes?: T[]
}

const hasChildValue = <T extends string>(params: HasChildValueParameters<T>): QueryWrapper<T> => {
  const { queryWrapper, hasArray } = params;
  const excludedTypes = params.excludedTypes || [] as T[];
  const excludedValues = params.excludedValues || []

  const checkValue = (node: Node, value: string) => {
    if (excludedValues.includes(node.value) || node.value === value) {
      return true
    }
    return false;
  }

  const checkType = (node: Node<T>, type: string) => {
    if (excludedTypes.includes(node.type) || node.type === type) {
      return true
    }
    return false;
  }

  const checkChild = (nodeWrapper: NodeWrapper<T>, idx: number) => {
    const { node } = nodeWrapper;
    const { value } = hasArray[idx].node;
    const type =  hasArray[idx].node.type as T

    if (checkType(node, type) && checkValue(node, value as string)) {
      return true
    }

    return false
  }

  const newQueryWrapper = queryWrapper
    .filter((nodeWrapper) => {
      if (nodeWrapper.hasChildren) {
        return nodeWrapper.children.every((childNode, idx) => checkChild(childNode, idx));
      }
      return false
    });

  return newQueryWrapper
};

export default {
  type: hasType,
  childValue: hasChildValue
};
