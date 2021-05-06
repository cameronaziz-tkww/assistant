function before<T extends (...args: App.ShouldDefineType[]) => App.ShouldDefineType>(n: number, func: T): T {
  let result: ReturnType<T>;
  let fn: T | undefined = func;

  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }

  return function (this: T, ...args) {
    if (--n > 0 && fn) {
      result = fn.apply(this, args);
    }
    if (n <= 1) {
      fn = undefined;
    }
    return result;
  } as T;
}

export default before;
