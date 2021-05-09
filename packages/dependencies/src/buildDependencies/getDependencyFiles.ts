import { fileSystem } from '@tkww-assistant/utils';
import { ReadPackageJSON, DependencyFile, StandardOptions } from '..';

const getDependencyFiles = async (
  pkgJSON: ReadPackageJSON.Success,
  workspacePath: string,
  options?: StandardOptions,
): Promise<DependencyFile[]> => {
  if (pkgJSON.pkg.files) {
    const { path } = pkgJSON
    const dependencyPath = path.replace(`${workspacePath}/`, '').replace('package.json', '')
    const glob = `${pkgJSON.pkg
      .files
      .map((file: string) => `${dependencyPath}${file}`)
      .join('|')}`;

    const findFiles = options?.readCallbacks?.findFiles || fileSystem.findFiles;
    const readFile = options?.readCallbacks?.file || fileSystem.readFile;

    const locations = await findFiles(glob, `${workspacePath}`);

    const promises = locations.map(async (location) => {
      // Read the file
      const bufferData = await readFile(location);

      // Convert the Buffer into text.
      const content = Buffer.from(bufferData)
        .toString('utf8');

      const file: DependencyFile= {
        location,
        content,
      };
      return file;
    });

    const rawFiles = await Promise.all(promises);
    return rawFiles
      .filter((rawFile) => rawFile.location.includes(workspacePath))
      .map((file) => ({
        ...file,
        location: file.location.replace(`${workspacePath}/${dependencyPath}`, '/'),
      }));
  }
  return [];
}

export default getDependencyFiles;
