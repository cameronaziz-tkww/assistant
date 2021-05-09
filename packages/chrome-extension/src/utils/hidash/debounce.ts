const debounce = <T extends App.UnknownFunction>(func: T, wait: number, immediate?: boolean): T => {
  let timeout: NodeJS.Timeout | null;

  return function (this: typeof func, ...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  } as T;
};

export default debounce;