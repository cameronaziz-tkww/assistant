import { Node, QueryWrapper, ValueType } from 'query-ast';
import { StylesheetNodeType } from 'scss-parser'
import { Colors } from '.';

const valueIsNodeArr = <T extends string = string, U extends object = {}>(value: Node<T, U>[] | string | undefined): value is Node<T, U>[] => typeof value !== 'string';
const valueIsString = <T extends string = string, U extends object = {}>(value: Node<T, U>[] | string | undefined): value is string => typeof value === 'string';

type QueryWrapperTypes<T extends string, U extends object> = QueryWrapper<StylesheetNodeType, U> | QueryWrapper<T, U> | QueryWrapper<ValueType, U>;

const wrapperIsValueNodes = <T extends string, U extends object>(wrapper: QueryWrapperTypes<T, U>): wrapper is QueryWrapper<ValueType, U> => {
  const wrapperAsValue = wrapper as QueryWrapper<ValueType, U>;
  return wrapperAsValue
    .map(({ node }) => typeof node.value === 'string')
    .every((result) => result)
};

const wrapperIsStyleSheet = <T extends string>(wrapper: QueryWrapper<T>): wrapper is QueryWrapper<T> =>
  wrapper
    .parents(({ node }) => node.type === 'stylesheet')
    .length() > 0;

const hexIsNumber = <T extends object>(
    unknown: Colors.ToHexParam<T>
): unknown is number =>
  typeof unknown === 'number';

const optionIsNumber = (
  unknown: number | boolean | undefined
): unknown is number =>
  typeof unknown === 'number';

export default {
  hexIsNumber,
  optionIsNumber,
  valueIsNodeArr,
  valueIsString,
  wrapperIsStyleSheet,
  wrapperIsValueNodes,
};
