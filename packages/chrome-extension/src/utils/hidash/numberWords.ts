/* eslint-disable eqeqeq */

const DIGITS = [
  '',
  'one ',
  'two ',
  'three ',
  'four ',
  'five ',
  'six ',
  'seven ',
  'eight ',
  'nine ',
  'ten ',
  'eleven ',
  'twelve ',
  'thirteen ',
  'fourteen ',
  'fifteen ',
  'sixteen ',
  'seventeen ',
  'eighteen ',
  'nineteen ',
];

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

const getLessThan20 = (n: string) => DIGITS[Number(n)];
const getGreaterThan20 = (n: string) => `${TENS[n[0]]} ${DIGITS[n[1]]}`;

interface Options {
  capitalize?: boolean;
}

const format = (n: string, word?: string): string => {
  const num = Number(n);
  if (num !== 0) {
    return getLessThan20(n) || `${getGreaterThan20(n)}${word || ''} `;
  }
  return '';
};

const and = (n: string | 0, base: string): string => {
  if (n != 0 && base !== '') {
    return 'and ';
  }
  return '';
};

const numberWords = (input: number, options?: Options): string => {
  const num = Number(input);

  if (isNaN(num)) {
    throw new Error(`numberWords: Input not a number; Received ${typeof input}`);
  }

  if (num === 0) {
    return 'zero';
  }

  const numStr = num.toString();

  if (numStr.length > 9) {
    throw new Error(`numberWords: Maximum 9 digits; Received ${numStr.length} digits`);
  }

  const match = `000000000${numStr}`.substr(-9).match(regex);

  if (!match) {
    throw new Error('Not a number');
  }
  const [, n1, n2, n3, n4, n5] = match;

  const crore = format(n1, 'crore');
  const lakh = format(n2, 'lakh');
  const thousand = format(n3, 'thousand');
  const hundred = format(n4, 'hundred');

  const base = `${crore}${lakh}${thousand}${hundred}`;

  const five = and(n5, base);
  const six = format(n5);

  const word = `${base}${five}${six}`.trim();

  if (options?.capitalize) {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  }

  return word;
};

export default numberWords;