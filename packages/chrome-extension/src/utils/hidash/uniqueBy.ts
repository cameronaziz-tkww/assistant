const uniqueBy = <T>(a: T[], key: (item: T) => App.ShouldDefineType): T[] => {
  const seen = new Set();
  return a.filter(item => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
};

export default uniqueBy;
