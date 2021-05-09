import { Value } from '../../types';

const camelToSnake = (key?: Value) => {
  if (typeof key !== 'string') {
    return key?.toString();
  }

  if (key.toUpperCase() === key) {
    return key;
  }

  return key
    .replace(/(([A-Z])(?![A-Z])|(?<=[a-z])([A-Z]))(?!$)/g, ' $1' )
    .split(' ')
    .join('_')
    .toUpperCase()
    .replace(/^_/, '');
};

export default camelToSnake;
