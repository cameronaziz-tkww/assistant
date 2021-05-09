import fs from 'fs';
import glob from 'glob';
import { FileSystem } from '.';

const findFiles = (pattern: string, cwd: string): Promise<string[]> => new Promise(
  (resolve, reject) => {
    glob(
      pattern,
      {
        cwd,
      },
      (error, files) => {
        if (error) {
          reject(error);
        }
        const paths = files
          .map((file) => `${cwd}/${file}`);
        resolve(paths);
      }
    );
  },
);

const readFile = (path: string): Promise<Uint8Array> => new Promise(
  (resolve, reject) => {
    fs.readFile(
      path,
      (error, readBuffer) => {
        if (error) {
          console.error(error);
          reject(error);
        }
        resolve(readBuffer);
      },
    );
  },
);

const getFileType = (file: fs.Dirent): FileSystem.FileType => {
  if (file.isFile()) {
    return 1;
  }
  if (file.isDirectory()) {
    return 2;
  }
  if (file.isSymbolicLink()) {
    return 64;
  }
  return 0;
};

const readDirectory = (path: string): Promise<FileSystem.Directory[]> => new Promise(
  (resolve, reject) => {
    fs.readdir(
      path,
      {
        withFileTypes: true,
      },
      (error, files) => {
        if (error) {
          reject(error);
        }
        const data: FileSystem.Directory[] = files.map((file) => {
          const fileType = getFileType(file);
          return [file.name, fileType];
        });
        resolve(data);
      },
    );
  },
);

const readDirectorySync = (path: string): FileSystem.Directory[] => {
  const files = fs.readdirSync(
    path,
    {
      withFileTypes: true,
    },
  );
  const data: FileSystem.Directory[] = files.map((file) => {
    const fileType = getFileType(file);
    return [file.name, fileType];
  });
  return data;
};

export default {
  findFiles,
  readDirectory,
  readDirectorySync,
  readFile,
}