import iconv from 'iconv-lite';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShouldDefineType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownObject = Record<string, ShouldDefineType>;

const DEFAULT_CHARSET = 'utf8';

const isUTF8 = (charset?: string) => {
  if (!charset) {
    return true;
  }
  charset = charset.toLowerCase();
  return charset === 'utf8' || charset === 'utf-8';
};

export const encode = (str: string, charset?: string): string => {
  if (isUTF8(charset)) {
    return encodeURIComponent(str);
  }

  const buf = iconv.encode(str, charset || DEFAULT_CHARSET);
  let encodeStr = '';
  let ch = '';
  for (let i = 0; i < buf.length; i++) {
    ch = buf[i].toString(16);
    if (ch.length === 1) {
      ch = '0' + ch;
    }
    encodeStr += '%' + ch;
  }
  encodeStr = encodeStr.toUpperCase();
  return encodeStr;
};

export const decode = (str: string, charset?: string): string => {
  if (isUTF8(charset) || !charset) {
    return decodeURIComponent(str);
  }

  const bytes: number[] = [];
  for (let i = 0; i < str.length;) {
    if (str[i] === '%') {
      i++;
      bytes.push(parseInt(str.substring(i, i + 2), 16));
      i += 2;
    } else {
      bytes.push(str.charCodeAt(i));
      i++;
    }
  }
  const buf = new Buffer(bytes);
  return iconv.decode(buf, charset);
};

const getSeparator = (separator?: string | UnknownObject) => {
  if (!separator || typeof separator === 'object') {
    return '&';
  }

  return separator;
};

interface Options {
  maxKeys?: number;
  charset?: string;
}

export const parse = (
  queryString: string,
  separator?: string | UnknownObject,
  equals?: string,
  options?: Options,
): UnknownObject => {
  if (typeof separator === 'object') {
    // parse(qs, options)
    options = separator;
  }

  const sep = getSeparator(separator);
  const eq = equals || '=';
  const obj = {};

  if (typeof queryString !== 'string' || queryString.length === 0) {
    return obj;
  }

  const regexp = /\+/g;
  const qs = queryString.split(sep);

  let maxKeys = 1000;
  let charset: null | string = null;
  if (options) {
    if (typeof options.maxKeys === 'number') {
      maxKeys = options.maxKeys;
    }
    if (typeof options.charset === 'string') {
      charset = options.charset;
    }
  }

  let len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  charset = charset || DEFAULT_CHARSET;
  for (let i = 0; i < len; ++i) {
    const x = qs[i].replace(regexp, '%20');
    const idx = x.indexOf(eq);
    let kstr;
    let vstr;
    let k;
    let v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    if (kstr && kstr.indexOf('%') >= 0) {
      try {
        k = decode(kstr, charset);
      } catch (e) {
        k = kstr;
      }
    } else {
      k = kstr;
    }

    if (vstr && vstr.indexOf('%') >= 0) {
      try {
        v = decode(vstr, charset);
      } catch (e) {
        v = vstr;
      }
    } else {
      v = vstr;
    }

    if (!has(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

const has = (obj: UnknownObject, prop: string) => Object.prototype.hasOwnProperty.call(obj, prop);

function isASCII(str) {
  return (/^[\x00-\x7F]*$/).test(str);
}

const encodeComponent = (item, charset) => {
  item = String(item);
  if (isASCII(item)) {
    item = encodeURIComponent(item);
  } else {
    item = encode(item, charset);
  }
  return item;
};

export const stringify = (obj: UnknownObject, prefix: string | null, options: Options): string => {
  if (typeof prefix !== 'string') {
    options = prefix || {};
    prefix = null;
  }
  const charset = options.charset || 'utf-8';
  if (Array.isArray(obj)) {
    return stringifyArray(obj, prefix, options);
  } else if ('[object Object]' === {}.toString.call(obj)) {
    return stringifyObject(obj, prefix, options);
  } else if ('string' === typeof obj) {
    return stringifyString(obj, prefix, options);
  } else {
    return prefix + '=' + encodeComponent(String(obj), charset);
  }
};

function stringifyString(str: string, prefix: string | null, options: Options) {
  if (!prefix) {
    throw new TypeError('stringify expects an object');
  }
  const charset = options.charset;
  return prefix + '=' + encodeComponent(str, charset);
}

function stringifyArray(arr, prefix, options) {
  const ret: string[] = [];
  if (!prefix) {
    throw new TypeError('stringify expects an object');
  }
  for (let i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[' + i + ']', options));
  }
  return ret.join('&');
}

function stringifyObject(obj, prefix, options) {
  const ret: string[] = [];
  const keys = Object.keys(obj);
  let key;

  const charset = options.charset;
  for (let i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    if ('' === key) {
      continue;
    }
    if (null === obj[key]) {
      ret.push(encode(key, charset) + '=');
    } else {
      ret.push(stringify(
        obj[key],
        prefix ? prefix + '[' + encodeComponent(key, charset) + ']' : encodeComponent(key, charset),
        options));
    }
  }

  return ret.join('&');
}

