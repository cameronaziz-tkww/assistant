const entries = <T>(obj: T): T extends ArrayLike<infer U> ? [string, U][] : { [K in keyof T]: [K, T[K]] }[keyof T][] =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.entries(obj) as any;

export default entries;