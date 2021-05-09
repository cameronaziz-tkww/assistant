const shallowCompare = <T extends App.UnknownObject>(a: T, b: T): boolean => {
  for (const key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

export default shallowCompare;