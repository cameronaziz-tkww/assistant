interface Crypto {
  getRandomValues<T extends Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | null>(array: T): T;
}

declare const msCrypto: Crypto;

const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

const validate = (uuid: string) =>
  typeof uuid === 'string' && REGEX.test(uuid);

let getRandomValues: Crypto;

const rnds8 = new Uint8Array(16);

const rng = () => {
  if (!getRandomValues) {
    if (typeof crypto !== 'undefined') {
      return crypto.getRandomValues(rnds8);
    }
    if (typeof msCrypto !== 'undefined') {
      return msCrypto.getRandomValues(rnds8);
    }

  }

  throw new Error(
    'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported',
  );
};

const byteToHex: string[] = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

const stringify = (arr: Uint8Array) => {
  const offset = 0;

  const uuid = `${''
    }${byteToHex[arr[offset + 0]]}${''
    }${byteToHex[arr[offset + 1]]}${''
    }${byteToHex[arr[offset + 2]]}${''
    }${byteToHex[arr[offset + 3]]}${''
    }-${''
    }${byteToHex[arr[offset + 4]]}${''
    }${byteToHex[arr[offset + 5]]}${''
    }-${''
    }${byteToHex[arr[offset + 6]]}${''
    }${byteToHex[arr[offset + 7]]}${''
    }-${''
    }${byteToHex[arr[offset + 8]]}${''
    }${byteToHex[arr[offset + 9]]}${''
    }-${''
    }${byteToHex[arr[offset + 10]]}${''
    }${byteToHex[arr[offset + 11]]}${''
    }${byteToHex[arr[offset + 12]]}${''
    }${byteToHex[arr[offset + 13]]}${''
    }${byteToHex[arr[offset + 14]]}${''
    }${byteToHex[arr[offset + 15]]}${''
    }`
    .toLowerCase();

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
};

const v4 = (): string => {
  const randoms = rng();

  randoms[6] = (randoms[6] & 0x0f) | 0x40;
  randoms[8] = (randoms[8] & 0x3f) | 0x80;

  return stringify(randoms);
};

export default v4;