const throttle = <T extends App.UnknownFunction>(func: T, limit): T => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;

  return function (this: typeof func, ...args: Parameters<T>) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  } as T;
};

export default throttle;