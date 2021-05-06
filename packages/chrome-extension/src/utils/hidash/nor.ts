const nor = (first: boolean, second: boolean): boolean => {
  if (first && !second) {
    return false;
  }

  if (!first && second) {
    return false;
  }

  return true;
};

export default nor;
