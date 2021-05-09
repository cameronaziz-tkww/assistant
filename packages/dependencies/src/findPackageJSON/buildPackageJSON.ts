import { BuildPackageJSONConfig } from '..';
import recursiveRead from './recursiveRead';

const buildPackageJSON = async (config: BuildPackageJSONConfig) => {
  const { workspacePath, path, options, dependency } = config;
  try {
    const dependencyPkg = await recursiveRead({
      dependency,
      path,
      workspacePath,
      options,
    });
    if (dependencyPkg.pkg) {
      return dependencyPkg
    }
  } catch(error) {
    // We don't want to do anything.
    // Whenever a folder does not have a package.json, it will throw.
  }
};

export default buildPackageJSON;
