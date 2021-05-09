import fs from 'fs';
import { deflateSync, inflateSync } from 'zlib';
import { mergeDeep } from './hidash';

const cwd = process.cwd();
const cacheFile = `${cwd}/node_modules/.tkww-assistant-cache`;
const cacheZip = `${cwd}/node_modules/.tkww-assistant-cache.gz`;

const nodeModulesExists = fs.readdirSync(cwd)
  .includes('node_modules');
const cacheExists = nodeModulesExists && fs.existsSync(cacheFile);

export const write = (value: Record<string, any>) => {
  if (!nodeModulesExists) {
    fs.mkdirSync(`${cwd}/node_modules`);
  }

  const currentCache = read();
  const updates = mergeDeep(currentCache, value);

  fs.writeFileSync(cacheFile, JSON.stringify(updates, null, 2));
};

const writeEmptyFile = () => {
  if (!nodeModulesExists) {
    fs.mkdirSync(`${cwd}/node_modules`);
  }

  const file = {
    processId: process.pid,
  };
  fs.writeFileSync(cacheFile, JSON.stringify(file, null, 2));
  return file;
};

export const read = (): Record<string, any> => {
  const { pid } = process;
  if (!cacheExists) {
    return writeEmptyFile();
  }

  const file = fs.readFileSync(cacheFile, 'utf8');

  try {
    const currentCache = JSON.parse(file);
    if (currentCache.processId !== pid) {
      return writeEmptyFile();
    }
    return currentCache;
  } catch {
    fs.unlinkSync(cacheFile);
    return writeEmptyFile();
  }
};

// Unzip it
if (nodeModulesExists && fs.existsSync(cacheZip)) {
  const zip = fs.readFileSync(cacheZip, 'utf8');
  const file = inflateSync(zip);
  fs.writeFileSync(cacheFile, file);
}

// Zip it up
process.on('exit', () => {
  if (!cacheExists) {
    return;
  }

  const buffer = deflateSync(cacheFile);
  fs.writeFileSync(cacheZip, buffer);
  fs.unlinkSync(cacheFile);
});
