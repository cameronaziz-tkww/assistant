/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Key = number | string;
type ArrNo = [any, Key, any];
type ArrYes = [any, Key, any, PropertyDescriptor];
type ArrUndefined = [any, Key, any, undefined];
type Arr = ArrNo | ArrYes | ArrUndefined;
type ReplacerStack = [any, Key];
type ReplacerParameter =
  | null
  | ((this: any, key: string, value: any) => any)
  | number[]
  | string[];

const arr: Arr[] = [];
const replacers: ReplacerStack[] = [];

// Regular stringify
const stringify = (
  obj: object,
  replacer?: ReplacerParameter,
  spacer?: string | number,
  depth?: number,
) => {
  const maxDepth = depth || 10;
  build(obj, '', [], undefined, maxDepth);
  let res: string;
  if (replacers.length === 0) {
    // @ts-ignore
    res = JSON.stringify(obj, replacer, spacer);
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
  }
  while (arr.length !== 0) {
    const part = arr.pop();
    if (part) {
      if (typeof part[3] !== 'undefined') {
        Object.defineProperty(part[0], part[1], part[3]);
      } else {
        part[0][part[1]] = part[2];
      }
    }
  }
  return res;
};

const build = (
  val: any,
  k: number | string,
  stack: ReplacerStack[],
  parent: any,
  depth: number,
) => {
  let i: number;

  // if (depth <= 0) {
  //   parent[k] = 'Max Depth';
  //   return;
  // }

  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i += 1) {
      if (stack[i] === val) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (typeof propertyDescriptor !== 'undefined') {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacers.push([val, k]);
          }
        } else {
          parent[k] = '[Circular]';
          arr.push([parent, k, val]);
        }
        return;
      }
    }

    stack.push(val);

    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i += 1) {
        build(val[i], i, stack, val, depth - 1);
      }
    } else {
      const keys = Object.keys(val);
      for (i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        build(val[key], key, stack, val, depth - 1);
      }
    }
    stack.pop();
  }
};

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export const deterministicStringify = (
  obj: object,
  replacer: ReplacerParameter,
  spacer?: string | number,
) => {
  const tmp = deterministicBuild(obj, '', [], undefined) || obj;
  let res: string;
  if (replacers.length === 0) {
    // @ts-ignore
    res = JSON.stringify(tmp, replacer, spacer);
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
  }
  while (arr.length !== 0) {
    const part = arr.pop();
    if (part) {
      if (typeof part[3] !== 'undefined') {
        Object.defineProperty(part[0], part[1], part[3]);
      } else {
        part[0][part[1]] = part[2];
      }
    }
  }
  return res;
};

function deterministicBuild (val, k, stack, parent) {
  let i: number;

  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i += 1) {
      if (stack[i] === val) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
        if (typeof propertyDescriptor !== 'undefined') {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' });
            arr.push([parent, k, val, propertyDescriptor]);
          } else {
            replacers.push([val, k]);
          }
        } else {
          parent[k] = '[Circular]';
          arr.push([parent, k, val]);
        }
        return null;
      }
    }
    if (typeof val.toJSON === 'function') {
      return null;
    }
    stack.push(val);
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i += 1) {
        deterministicBuild(val[i], i, stack, val);
      }
    } else {
      // Create a temporary object in the required way
      const tmp = {};
      const keys = Object.keys(val).sort(compareFunction);
      for (i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        deterministicBuild(val[key], key, stack, val);
        tmp[key] = val[key];
      }
      if (parent !== undefined) {
        arr.push([parent, k, val]);
        parent[k] = tmp;
      } else {
        return tmp;
      }
    }
    stack.pop();
  }
  return null;
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer?: ReplacerParameter) {
  const replacerFn = replacer !== undefined && replacer !== null
    ? replacer
    : function (_k: Key, v: any) { return v; };

  return function (this: any, key: string, val: any) {
    if (replacers.length > 0) {
      for (let i = 0; i < replacers.length; i += 1) {
        const part = replacers[i];
        if (part[1] === key && part[0] === val) {
          val = '[Circular]';
          replacers.splice(i, 1);
          break;
        }
      }
    }
    // @ts-ignore
    return replacerFn.call(this, key, val);
  };
}

export default stringify;
