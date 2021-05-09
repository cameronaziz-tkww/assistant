import { isObject } from './isObject';
import type { MergeDeep } from '../../types';

const mergeDeep: typeof MergeDeep = <T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
) => {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key] as T[Extract<keyof T, string>]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

export default mergeDeep;
