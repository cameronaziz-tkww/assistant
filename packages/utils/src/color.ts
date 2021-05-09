import { Colors } from '.';
import typeGuards from './typeGuards';

const padZero = (str: string, len: number = 2) => {
  var zeros = new Array(len)
    .join('0');
  return (zeros + str).slice(-len);
};

const getHexValues = (hex: string): string => {
  switch(hex.length) {
    case 3: return `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    case 4: return `${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    case 7: return `${hex[1]}${hex[2]}${hex[3]}${hex[4]}${hex[5]}${hex[6]}`;
    default: return hex
  }
};

const hexToRGB: Colors.HexToRGB = function(
  hex: string,
  option?: number | boolean
) {
  const hexValues = getHexValues(hex);
  const r = parseInt(`0x${hexValues[0]}${hexValues[1]}`, 16);
  const g = parseInt(`0x${hexValues[2]}${hexValues[3]}`, 16);
  const b = parseInt(`0x${hexValues[4]}${hexValues[5]}`, 16);

  const optionIsNumber = typeGuards.optionIsNumber(option)
  if (option || optionIsNumber) {
    const opacity = optionIsNumber ? `, ${option}` : '';
    return `rgb${optionIsNumber ? 'a' : ''}(${r}, ${g}, ${b}${opacity})`;
  }

  return {
    r,
    g,
    b,
  };
};

const toHex = <T extends object>(
  conversion: Colors.ToHexParam<T>
): T => {
  if (typeGuards.hexIsNumber(conversion)) {
    return `0x${conversion.toString(16)}` as unknown as T;
  }
  for (const key in conversion) {
    const hex = (conversion[key] as unknown as number).toString(16);
    conversion[key] = `0x${hex}` as unknown as T[typeof key];
  }
  return conversion;
}

const rgbToHSL: Colors.RBGToHSL = (rgb: Colors.RGB, toObject?: boolean) => {
  let { r, g, b } = toHex(rgb);
  r /= 255;
  g /= 255;
  b /= 255;
  const cMin = Math.min(r,g,b);
  const cMax = Math.max(r,g,b);
  let delta = cMax - cMin;
  let h = 0;
  let s = 0;
  let l = 0;

  if (delta == 0)
    h = 0;
  else if (cMax == r)
    h = ((g - b) / delta) % 6;
  else if (cMax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cMax + cMin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  if (toObject) {
    return {
      h,
      s,
      l,
    };
  }
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const hexToHSL: Colors.HexToHSL = (hex: string, toObject?: boolean) => {
  const rgb = hexToRGB(hex);
  if (toObject) {
    return rgbToHSL(rgb, true);
  }
  return rgbToHSL(rgb);
};

const invertColor = (hex: string, bw?: boolean) => {
  if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
  }
  let r: string | number = parseInt(hex.slice(0, 2), 16);
  let g: string | number = parseInt(hex.slice(2, 4), 16);
  let b: string | number = parseInt(hex.slice(4, 6), 16);

  if (bw) {
      // http://stackoverflow.com/a/3943023/112731
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186
          ? '#000000'
          : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
};

export default {
  getHexValues,
  hexToHSL,
  hexToRGB,
  invertColor,
  rgbToHSL,
};
