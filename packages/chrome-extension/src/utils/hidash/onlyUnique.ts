const onlyUnique = <T>(value: T, index: number, self: T[]): boolean =>
  self.indexOf(value) === index;

export default onlyUnique;
