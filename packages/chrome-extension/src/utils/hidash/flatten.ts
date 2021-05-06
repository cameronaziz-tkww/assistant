const flatten = <T extends App.ShouldDefineType[]>(arr: T[]): T =>
  arr.reduce(
    (flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
    [],
  ) as unknown as T;

export default flatten;