export type PropertyNamesOnly<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];
