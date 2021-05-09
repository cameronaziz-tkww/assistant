import deepCopy from './deepCopy';

const spreadGlobalOptions = <
  T extends object,
  U = GlobalOptions<T>,
  V extends Partial<GlobalBase> = Partial<AttributeOptions<U>>
>(
    defaultOptions: U,
    contextOptions: V,
  ): U => {

  const options = deepCopy(defaultOptions);
  const keys = Object.keys(contextOptions);


  keys.forEach((key) => {
    if (!options[key]) {
      for (const attribute in options) {
        if (options[attribute][key]) {
          options[attribute][key] = contextOptions[key];
        }
      }
    }
  });

  return options;
};

type AttributeOptions<T> = T & {
  [key: string]: T
}

type GlobalBase = {
  types?: readonly string[]
}

type GlobalOptions<T> = T & GlobalBase;

const applyDefaultOptions = <
  T extends object,
  // U = GlobalOptions<T>,
  V extends Partial<GlobalBase> = Partial<AttributeOptions<T>>
>(
    defaultTypes: readonly string[],
    defaultOptions: T,
    contextOptions?: V,
  ): T => {

  if (!contextOptions) {
    return defaultOptions;
  }


  const attributes = contextOptions
    && contextOptions.types
    ? contextOptions.types
    : defaultTypes;


  const options = spreadGlobalOptions(defaultOptions, contextOptions);
  const base = { enabled: true };

  if (attributes) {
    attributes.forEach(
      (type) => {
        Object.assign(options[type], contextOptions[type], base);
      },
    );
  }


  return options;
};

export default applyDefaultOptions;
