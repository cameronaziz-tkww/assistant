import { STYLE_EXTENSIONS } from './constants';
import type { ParseValue, RuleConfig, Specifier } from './types';

const caseSensitivity = ([specifierValue, ruleOptions]: ParseValue): ParseValue =>
  [ruleOptions.ignoreCases ? specifierValue.toLowerCase() : specifierValue, ruleOptions];

const ignoreLeadingAt = ([specifierValue, ruleOptions]: ParseValue): ParseValue =>
  [ruleOptions.ignoreLeadingAt ? removeLeadingAt(specifierValue) : specifierValue, ruleOptions];

const reactAlwaysFirst = ([specifierValue, ruleOptions]: ParseValue): boolean =>
  ruleOptions.reactAlwaysFirst ? specifierValue.toLowerCase() === 'react' : false;

const parseIsAbsolute = ([specifierValue]: ParseValue): boolean =>
  !specifierValue.startsWith('.');

const parseLocation = (specifierValue: string): string => {
  const split = specifierValue.split('/');
  return split[split.length - 1] || '';
};
const parseDistance = ([specifierValue]: ParseValue): number => {
  const split = specifierValue.split('/');
  if (split[0] === '.') {
    return 0;
  }
  const distance = split.findIndex((dotdot) => dotdot !== '..');
  return distance > 0 ? distance : Number.MAX_SAFE_INTEGER;
};

const removeLeadingAt = (specifierValue: string): string =>
  specifierValue.charAt(0) === '@' ? specifierValue.slice(1) : specifierValue;

const isStyle = ([location, ruleOptions]: ParseValue): boolean => {
  if (ruleOptions.styleAlwaysLast) {
    const locationSplit = location.split('.');
    // location is a folder or a package
    if (locationSplit.length === 1) {
      return false;
    }
    const extension = locationSplit[locationSplit.length - 1] || '';
    return STYLE_EXTENSIONS.includes(extension);
  }
  return false;
};

const parseValue = (specifier: Specifier, options: RuleConfig) => {
  const parsedValue = ignoreLeadingAt(
    caseSensitivity(
      [specifier.value?.toString() || '', options],
    ),
  );

  const [value] = parsedValue;
  const location = parseLocation(value);

  return {
    value,
    isReact: reactAlwaysFirst(parsedValue),
    isAbsolute: parseIsAbsolute(parsedValue),
    distance: parseDistance(parsedValue),
    isStyle: isStyle([location, options]),
    location,
  };
};

const compare = (aSpecifier: Specifier, bSpecifier: Specifier, options: RuleConfig) => {

  const a = parseValue(aSpecifier, options);
  const b = parseValue(bSpecifier, options);

  // isReact will be false if reactAlwaysFirst is false
  if (a.isReact && !b.isReact) {
    return -1;
  }

  if (!a.isReact && b.isReact) {
    return 1;
  }

  // Tisk tisk, they are both react
  if (a.isReact && b.isReact) {
    return 0;
  }

  // Absolutes before locals
  if (a.isAbsolute && !b.isAbsolute) {
    return -1;
  }

  if (a.isAbsolute && !b.isAbsolute) {
    return 1;
  }

  // Both Absolute we can sort alphabetically
  if (a.isAbsolute && b.isAbsolute) {
    if (a.value < b.value) {
      return -1;
    }
    if (a.value > b.value) {
      return 1;
    }
    return 0;
  }

  // isStyle will be false is styleAlwaysLast is false
  if (a.isStyle && !b.isStyle) {
    return 1;
  }

  if (!a.isStyle && b.isStyle) {
    return -1;
  }

  // Farther imports come first
  if (a.distance > b.distance) {
    return -1;
  }

  if (a.distance < b.distance) {
    return 1;
  }

  // If same distance, sort alphabetically
  if (a.value < b.value) {
    return -1;
  }

  if (a.value > b.value) {
    return 1;
  }

  return 0;
};

export default compare;
