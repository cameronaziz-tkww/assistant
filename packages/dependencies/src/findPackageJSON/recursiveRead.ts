import { posix } from 'path';
import { ReadPackageJSON, StandardOptions } from '..';
import readPackageJSON from './readPackageJSON';

interface RecursiveReadConfig {
  dependency: string;
  path: string;
  workspacePath: string;
  options?: StandardOptions;
}

const recursiveRead = async (config: RecursiveReadConfig): Promise<ReadPackageJSON.Response> => {
  const { dependency, path, workspacePath, options } = config;

  const paths = path.split('/')
  paths.pop();
  const currentPath = paths.join('/');

  const dependencyJSONPath = posix.join(
    currentPath,
    `node_modules/${dependency}/package.json`
  );
  const packageJSON = await readPackageJSON(
    dependencyJSONPath,
    {
      readCallbacks: options?.readCallbacks,
    }
  );

  if (packageJSON.pkg) {
    return packageJSON
  }

  if (paths.length < workspacePath.split('/').length) {
    return {
      pkg: undefined,
      path: workspacePath,
      error: 'Not Found',
    }
  }
  return await recursiveRead({
    dependency,
    path: currentPath,
    workspacePath,
    options
  })
};

export default recursiveRead;
