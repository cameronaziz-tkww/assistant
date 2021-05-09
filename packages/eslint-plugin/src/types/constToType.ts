export const stringLiterals = <T extends string>(...args: T[]): T[] => args;
/* eslint-disable no-shadow */
export type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer ElementType> ? ElementType : never;
