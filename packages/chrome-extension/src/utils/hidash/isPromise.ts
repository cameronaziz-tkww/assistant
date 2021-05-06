const isPromise = <T>(value: T): boolean =>
  value != null && typeof (value as App.ShouldDefineType).then === "function";

export default isPromise;