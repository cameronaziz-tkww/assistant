import { fileSystem, log } from '@tkww-assistant/utils';
import { ReadPackageJSON, StandardOptions } from '..';

const readPackageJSON = async (
  path: string,
  options?: StandardOptions,
): Promise<ReadPackageJSON.Response> => {
  const readFile = options?.readCallbacks?.file || fileSystem.readFile;
  try {
    const readBuffer = await readFile(path)
    const packageJsonString = Buffer
      .from(readBuffer)
      .toString('utf8');

    return {
      pkg: JSON.parse(packageJsonString),
      path,
      error: undefined,
    };
  } catch(err) {
    log(
      `Failed Reading File File ${path}`,
      {
        ...options,
        level: 2,
      }
    );
    return {
      pkg: undefined,
      path,
      error: 'Not Found',
    };
  }
};

export default readPackageJSON;
