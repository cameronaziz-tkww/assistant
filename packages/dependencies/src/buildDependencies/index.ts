import query, { JSONNode, QueryWrapper } from 'query-ast';
import buildFiles from './buildFiles';
import getDependencyFiles from './getDependencyFiles';
import { ReadPackageJSON, SchemaType, StandardOptions } from '..';

interface BuildDependenciesConfig {
  packageJSONs: ReadPackageJSON.Success[];
  workspacePath: string;
  options?: StandardOptions;
}

const buildDependencies = async (config: BuildDependenciesConfig): Promise<QueryWrapper<SchemaType>[]> => {
  const { packageJSONs, workspacePath, options } = config;
  const promises = packageJSONs.map(
    async (packageJSON) => {
      const { pkg: { name, version }, path } = packageJSON;

      const nameNode: JSONNode<SchemaType> = {
        type: 'name',
        value: name,
      };

      const versionNode: JSONNode<SchemaType> = {
        type: 'version',
        value: version,
      };

      // Might not need this
      const pathNode: JSONNode<SchemaType> = {
        type: 'path',
        value: path,
      };

      const dependencyFiles = await getDependencyFiles(
        packageJSON,
        workspacePath,
        options,
      );

      const files = buildFiles(dependencyFiles) as JSONNode<SchemaType>[];

      const dependency: JSONNode<SchemaType> = {
        type: 'dependency',
        value: [
          nameNode,
          versionNode,
          pathNode,
          ...files,
        ],
      };

      return query(dependency)() as QueryWrapper<SchemaType>;
    },
  );

  return Promise.all(promises);
};

export default buildDependencies;
