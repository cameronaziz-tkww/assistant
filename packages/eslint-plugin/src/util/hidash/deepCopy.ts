import { isObjectLike } from './isObject';

const deepCopy = <T>(source: T): T => {
  if (!isObjectLike(source) || source === null) {
    return source;
  }

  const outObject = (Array.isArray(source) ? [] : {}) as T;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const value = source[key];
      outObject[key] = deepCopy(value);
    }
  }

  return outObject;
};

export default deepCopy;
