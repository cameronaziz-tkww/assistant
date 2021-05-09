import deepCopy from './deepCopy';

const isDefined = <T extends Record<string, any>>(
  unknown?: T[Extract<keyof T, string>]
): unknown is T[Extract<keyof T, string>] => typeof unknown !== 'undefined';

const applyOptions = <T extends Record<string, any>> (
  defaultOptions: T,
  contextOptions: Partial<T>,
): T => {
  if (!contextOptions) {
    return defaultOptions;
  }

  const options = deepCopy(defaultOptions);

  for (const property in options) {
    const value = contextOptions[property];
    if (isDefined(value)) {
      if (typeof contextOptions[property] === 'object') {
        options[property] = applyOptions(options[property], value)
      } else {
        options[property] = value;
      }
    }
  }
  return options;
};

export default applyOptions;