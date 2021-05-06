declare namespace HiDash {
  interface Callback {
    (): App.ShouldDefineType
  }

  interface ArrayCallback<T> {
    (value: T, index: number, self: T[]): boolean;
  }

  type Fn = (...args: App.ShouldDefineType[]) => App.ShouldDefineType

  interface KeyFn<T extends App.ShouldDefineType[]> {
    (...args: T): string;
  }

  namespace Delay {
    interface Config<T extends Callback> {
      secondsAgo: number;
      timestamp: number;
      callback: T;
      ignoreTime?: boolean;
    }

    interface Result<T extends Callback> {
      result: ReturnType<T> | null;
      didCall: boolean;
    }
  }

  namespace Memoize {
    interface Maps<T extends App.ShouldDefineType[]> {
      fn: Fn<T>;
      checker?: Fn<T>;
      keyFn?: KeyFn<T>;
      resetKey?: App.ShouldDefineType;
      resetFn?(): App.ShouldDefineType;
    }

    interface Mapping<T extends App.ShouldDefineType[] = App.ShouldDefineType[]> {
      [key: string]: Maps<T>;
    }

    interface CheckArgs<T extends App.ShouldDefineType[]> {
      current: T;
      previous: T;
    }

    interface Checker<T extends App.ShouldDefineType[]> {
      (args: CheckArgs<T>): boolean;
    }

    interface FancyMapper<T extends Fn> {
      previousArgs: Parameters<T>;
      previousReturn: ReturnType<T>;
      resetKey?: App.ShouldDefineType;
    }

    interface FancyMapping<T extends Fn> {
      [key: string]: FancyMapper<T>;
    }

    interface Add<T extends Fn> {
      id: string;
      fn: T;
      checker?: Checker<Parameters<T>>;
      keyFn?: KeyFn<Parameters<T>>;
      resetFn?(): App.ShouldDefineType;
    }

    interface FnRun<T extends Fn> {
      previousArgs: Parameters<T>;
      previousReturn: ReturnType<T>;
      checker: Checker<Parameters<T>>;
      args: Parameters<T>;
      mapConfig: Maps<T>;
    }
  }
}

