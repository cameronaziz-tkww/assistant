import shallowCompare from './shallowCompare';

const listCompare = <T extends App.UnknownObject>(a: T[], b: T[]): boolean =>
  a.length === b.length &&
  a.every((aItem) =>
    b.findIndex((bItem) =>
      shallowCompare(aItem, bItem),
    ) > -1,
  );

export default listCompare;