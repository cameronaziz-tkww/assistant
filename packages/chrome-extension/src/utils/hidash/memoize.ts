import nor from './nor';

const baseChecker = () => true;

class Memoize {
  private basicFns: HiDash.Memoize.Mapping<App.ShouldDefineType> = {};

  add = <T extends HiDash.Fn>(config: HiDash.Memoize.Add<T>): T => {
    const { id, resetFn, ...rest } = config;
    const resetKey = typeof resetFn === 'undefined' ? resetFn : resetFn();
    const fnIndex = this.basicFns[id];
    if (!fnIndex) {
      this.basicFns[id] = {
        ...rest,
        resetFn,
        resetKey,
      };
    }
    const func = this.basicFns[id];
    if (!nor(!!func.checker, !!rest.checker)) {
      throw new Error(`${id} was instantiated without a checker at least once and with a checker at least once`);
    }

    return this.build(func) as T;
  };

  private build = (config: HiDash.Memoize.Maps<App.ShouldDefineType>) => {
    const check = config.checker || baseChecker;

    if (!config.keyFn) {
      return this.buildBase(config, check);
    }

    return this.buildFancy(config, check, config.keyFn);
  };

  private buildFancy = <T extends HiDash.Fn>(mapConfig: HiDash.Memoize.Maps<App.ShouldDefineType>, checker: HiDash.Memoize.Checker<Parameters<T>>, keyFn: HiDash.KeyFn<Parameters<T>>) => {
    const mapping: HiDash.Memoize.FancyMapping<T> = {};

    return (...args: Parameters<T>) => {
      const key = keyFn(...args);

      if (!mapping[key] || mapping[key].resetKey !== mapConfig.resetKey) {
        mapping[key] = {
          previousArgs: args,
          previousReturn: mapConfig.fn(...args),
          resetKey: mapConfig.resetKey,
        };

        return mapping[key].previousReturn;
      }

      const { previousArgs, previousReturn } = mapping[key];

      const { nextArgs, nextReturn } = this.fnRun({
        checker,
        previousArgs,
        previousReturn,
        args,
        mapConfig,
      });

      mapping[key].previousArgs = nextArgs;
      mapping[key].previousReturn = nextReturn;

      return nextReturn;
    };
  }

  private buildBase = <T extends HiDash.Fn>(mapConfig: HiDash.Memoize.Maps<App.ShouldDefineType>, checker: HiDash.Memoize.Checker<Parameters<T>>) => {
    let previousArgs: Parameters<T>;
    let previousReturn: ReturnType<T>;

    return (...args: Parameters<T>) => {
      if (!previousArgs) {
        previousArgs = args;
        previousReturn = mapConfig.fn(...args);
        return previousReturn;
      }

      const { nextArgs, nextReturn } = this.fnRun({
        checker,
        previousArgs,
        previousReturn,
        args,
        mapConfig,
      });

      previousReturn = nextReturn;
      previousArgs = nextArgs;
      return nextReturn;
    };
  }

  private fnRun = <T extends HiDash.Fn>(config: HiDash.Memoize.FnRun<T>) => {
    const { previousArgs, previousReturn, checker, args, mapConfig } = config;
    const { resetFn, fn, resetKey } = mapConfig;
    const newResetKey = typeof resetFn === 'undefined' ? resetFn : resetFn();

    if (newResetKey !== resetKey) {
      return {
        nextArgs: args,
        nextReturn: fn(...args),
      };
    }

    const needsCall = checker({ current: args, previous: previousArgs });

    return {
      nextArgs: args,
      nextReturn: needsCall ? fn(...args) : previousReturn,
    };
  }
}

const instance = new Memoize();
Object.freeze(instance);

export default instance.add;
