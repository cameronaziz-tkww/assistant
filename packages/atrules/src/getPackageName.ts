import { QueryWrapper } from 'query-ast';
import { StylesheetNodeType } from 'scss-parser'

// This will receive a QueryWrapper for a File or a Rule.
// It will traverse up ancestors to determine the dependency name used for import.
const forDependency = <T extends string, U extends object>(dependenciesWrapper: QueryWrapper<T, U>): string => {
  const dependency = dependenciesWrapper
    .closest('dependency' as T);
  const dependencyName = dependency
    .find('name' as T)
    .value();

  return dependencyName;
};

// This will receive a QueryWrapper for a atRule(s).
// It will find all atValue rules and return an array of package names.
// If no atRules are found, it will return an empty array.
const forAtValue = (clientWrapper: QueryWrapper<StylesheetNodeType>, keepTilde?: boolean): string[] => {
  const packageNames = clientWrapper
    .find('atrule')
    .has(({ node }) => node.type === 'atkeyword' && node.value === 'value')
    .find(({ node }) => node.type === 'string_double' || node.type === 'string_single')
    .map(({ node }) => node.value as string)

  return keepTilde ? packageNames : packageNames.map((value) => value[0] === '~' ? value.substring(1) : value);
}

const getPackageName = {
  forDependency,
  forAtValue,
};

export default getPackageName;
