import { FindPackageJSON } from '..';
import readPackageJSON from './readPackageJSON';

const findNearestPackageJSON = async (config: FindPackageJSON.Config): Promise<FindPackageJSON.Response> => {
  const { path, options, dependencyNames } = config;
  const filePath = `${path}/package.json`;

  try {
    const packageJSON = await readPackageJSON(
      filePath,
      {
        readCallbacks: options?.readCallbacks,
      },
    );
    if (packageJSON.pkg && packageJSON.pkg.dependencies) {
      const { dependencies } = packageJSON.pkg;
      const foundDependencies = dependencyNames.filter((name) => dependencies[name]);
      if (foundDependencies.length > 0) {
        return {
          packageJSON: packageJSON,
          foundDependencies: foundDependencies,
        }
      }
    }
  } catch(error) {
    // We don't want to do anything.
    // Whenever a folder does not have a package.json, it will throw.
  }
  return {
    foundDependencies: [],
  };;
};

export default findNearestPackageJSON;
