import { QueryWrapper } from 'query-ast';
import { SchemaType, ReadPackageJSON } from '..';

const neededDependencies = (
  wrapper: QueryWrapper<SchemaType>,
  packageJSONs: ReadPackageJSON.Success[]
): ReadPackageJSON.Success[] => {
  const dependencies = wrapper.find('dependency');
  if (dependencies.length() === 0) {
    return packageJSONs;
  }

  return packageJSONs.filter(
    (packageJSON) =>
      dependencies
        .has(({ node }) => node.type === 'name' && node.value === packageJSON.pkg.name)
        .has(({ node }) => node.type === 'version' && node.value === packageJSON.pkg.version)
        .length() === 0
  );
};

const matchPackageJSON = (packageJSON: ReadPackageJSON.Success, wrapper: QueryWrapper<SchemaType>) => {
  return wrapper
    .find('dependency')
    .has(({ node }) => node.type === 'name' && node.value === packageJSON.pkg.name)
    .has(({ node }) => node.type === 'version' && node.value === packageJSON.pkg.version);
};

export default {
  matchPackageJSON,
  neededDependencies,
}