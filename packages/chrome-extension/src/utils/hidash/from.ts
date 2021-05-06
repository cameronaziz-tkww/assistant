const find = <T>(arr: T[], callback: HiDash.ArrayCallback<T>, start?: number): T | undefined => {
  const base = arr.slice(start);
  return base.find(callback);
};

const findIndex = <T>(arr: T[], callback: HiDash.ArrayCallback<T>, start?: number): number => {
  const base = arr.slice(start);
  return base.findIndex(callback);
};

export default {
  find,
  findIndex,
};