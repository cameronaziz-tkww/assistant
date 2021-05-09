import { log, constants } from '@tkww-assistant/utils';
import buildPackageJSON from './buildPackageJSON';
import findNearestPackageJSON from './findNearestPackageJSON';
import { StandardOptions, ReadPackageJSON, FindPackageJSON } from '..';

interface FindDependenciesConfig {
  path: string;
  workspacePath: string;
  options?: StandardOptions;
}


const isFindPackageJSONSuccess = (unknown: FindPackageJSON.Response): unknown is FindPackageJSON.Success =>
  unknown.foundDependencies.length > 0


const findPackageJSON = async (config: FindDependenciesConfig): Promise<ReadPackageJSON.Success[]> => {
  const { path, workspacePath, options } = config;
  const paths = path.split('/');
  const workspacePaths = workspacePath.split('/');
  // Check if File is in Workspace.
  if (!path.startsWith(workspacePath)) {
    log(
      `${path} is not in workspace`,
      {
        ...options,
        level: 1,
      },
    );
    return [];
  }

  // Remove filename
  paths.pop();
  const foundPackages: FindPackageJSON.Success[] = [];
  const dependencyPkgs: ReadPackageJSON.Success[] = [];
  let dependencyNames = constants.dependencyNames
    .map((dependency) => dependency.dependency)

  while (paths.length >= workspacePaths.length && dependencyNames.length > 0) {
    const findPackageJSONResponse = await findNearestPackageJSON({
      path: paths.join('/'),
      dependencyNames,
      options,
    });

    if (isFindPackageJSONSuccess(findPackageJSONResponse)) {
      dependencyNames = dependencyNames.filter((name) => !findPackageJSONResponse.foundDependencies.includes(name));
      foundPackages.push(findPackageJSONResponse);
    }
    paths.pop();
  }

  for (let foundPackage of foundPackages ) {
    for (let foundDependency of foundPackage.foundDependencies) {
      const buildPackageJSONResponse = await buildPackageJSON({
        dependency: foundDependency,
        path: foundPackage.packageJSON.path,
        options,
        workspacePath,
      });
      if (buildPackageJSONResponse) {
        dependencyPkgs.push(buildPackageJSONResponse);
      }
    }
  }

  return dependencyPkgs;
};

export default findPackageJSON;
