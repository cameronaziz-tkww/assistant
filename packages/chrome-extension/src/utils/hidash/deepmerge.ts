interface IsObject {
  (item: App.ShouldDefineType): boolean;
}

interface MergeKeys {
  [key: string]: MergeKeys | string;
}

export const isObject: IsObject = (item: App.ShouldDefineType): boolean => {
  return (item === Object(item) && !Array.isArray(item));
};

export const deepMerge = <T extends App.UnknownObject>(arrayMergeKeys: string | MergeKeys | undefined, target: T, ...sources: Array<T>): T => {
  if (!sources.length) {
    return target;
  }

  const result: T = target;

  if (isObject(result)) {
    const len: number = sources.length;

    for (let i = 0; i < len; i += 1) {
      const elm: App.ShouldDefineType = sources[i];

      if (isObject(elm)) {
        for (const key in elm) {
          if (elm.hasOwnProperty(key)) {
            const mergeKey = arrayMergeKeys ? arrayMergeKeys[key] : undefined;
            if (isObject(elm[key])) {
              if (!result[key] || !isObject(result[key])) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                result[key] = {};
              }
              deepMerge(mergeKey, result[key], elm[key]);
            } else {
              if (Array.isArray(result[key]) && Array.isArray(elm[key])) {
                if (typeof mergeKey === 'string') {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  result[key] = Array.from(result[key]).filter((item) => {
                    if (typeof item === 'object' && item !== null) {
                      return elm[key].findIndex((el) => el[mergeKey] === item[mergeKey]) < 0;
                    }
                    return true;
                  });
                  result[key].concat(elm[key]);
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                result[key] = Array.from(new Set(result[key].concat(elm[key])));
              } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                result[key] = elm[key];
              }
            }
          }
        }
      }
    }
  }

  return result;
};

export default deepMerge;
