import { QueryWrapper } from 'query-ast';
import getPackageName from './getPackageName';

/**
 * Gets the import location that is needed for a given node.
 *
 * @param {QueryWrapper<T>} queryWrapper - The query wrapper for the node to search from.
 * @return {string} - The string for the location to be imported.
 */
const getImportLocation = <T extends string, U extends object>(queryWrapper: QueryWrapper<T, U>): string => {
  const file = queryWrapper
    .closest('file' as T);
  const fileLocation = file
    .find('fileLocation' as T)
    .value();

  const dependencyName = getPackageName.forDependency(file);

  const importLocation = `${dependencyName}${fileLocation}`;

  return importLocation;
};

export default getImportLocation;
