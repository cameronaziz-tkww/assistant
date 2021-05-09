import shallowCompare from './shallowCompare';

const listDifferences = <T extends App.UnknownObject>(a: T[], b: T[]): T[] =>
  a.filter((aItem) =>
    b.findIndex((bItem) =>
      shallowCompare(aItem, bItem),
    ) < 0,
  );

export default listDifferences;