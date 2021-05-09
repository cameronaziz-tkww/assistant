import { Options, RecursivePartial } from '../../types';
import { isObject, deepCopy, mergeDeep } from '../hidash';

const defaultGlobal = undefined as unknown as Options.GlobalSchema;
type GlobalOptionsAdded<T extends unknown[]> = [...T, Options.GlobalSchema];

export const mergeGlobalOptions = <T extends unknown[]>(
  defaultOptions: T,
  consumerOptions?: Partial<GlobalOptionsAdded<T>>,
): GlobalOptionsAdded<T> => {
  if (!consumerOptions) {
    return [...defaultOptions, defaultGlobal];
  }

  const mergedOptions = deepCopy(defaultOptions);
  const allButGlobal = mergedOptions.map(
    (option, index) => {
      if (isObject(option)) {
        return mergeDeep(option, consumerOptions[index]);
      }
      return consumerOptions[index] || mergedOptions[index];
    },
  ) as T;
  return [...allButGlobal, defaultGlobal];
};

type Options = unknown | unknown[];

type DefaultOptions <T extends Options> =
  T extends Array<unknown>
  ? unknown[]
  : [unknown];

export const mergeOptions = <T extends unknown[]>(
  defaultOptions: T,
  consumerOptions?: DefaultOptions<RecursivePartial<T>>,
): T => {
  if (!consumerOptions?.length) {
    return defaultOptions;
  }

  const mergedOptions = deepCopy(defaultOptions);

  consumerOptions.forEach((option, index) => {
    if (isObject(option)) {
      if (!mergedOptions[index]) {
        mergedOptions[index] = option;
        return;
      }
      mergedOptions[index] = mergeDeep(mergedOptions[index], option);
      return;
    }
    mergedOptions[index] = consumerOptions[index] || mergedOptions[index];
  });

  return mergedOptions;
};
