/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import { TSESLint } from '@typescript-eslint/experimental-utils';
import fs from 'fs';
// import stringify from './stringify';
import stringify from 'json-stringify-safe';

interface SaveASTConfig <
  T extends object,
  U extends string,
  V extends unknown[],
>{
  node?: T | null;
  filePath?: string;
  savePath?: string;
  omitTimestamp?: boolean;
  context?: TSESLint.RuleContext<U, V>;
  directory?: string;
  preserveHistory?: boolean
}

const addTxt = (path: string) => path.endsWith('.json') ? path : `${path}.json`;

const getFromPath = (filePath: string): string => {
  const filePieces = filePath.split('/');
  return filePieces[filePieces.length - 1].split('.')[0];
};

const getPath = <
  T extends object,
  U extends string,
  V extends unknown[]
>(config: SaveASTConfig<T, U, V>) => {
  const { filePath, savePath, context, omitTimestamp } = config;
  const nowStamp = `-${Date.now()}`;
  const stamp = omitTimestamp ? '' : nowStamp;

  if (savePath) {
    return addTxt(`${savePath}${stamp}`);
  }

  if (filePath) {
    const file = getFromPath(filePath);
    return addTxt(`${file}${stamp}`);
  }

  if (context) {
    const contextPath = context.getFilename();
    const file = getFromPath(contextPath);
    return addTxt(`${file}${stamp}`);
  }

  return `ast${nowStamp}.json`;
};

const LOG_FILE = 'log.json';

interface Run {
  saveFile: string;
}
interface LogFile {
  lastRun: string;
  logFilePath: string;
  runs: Run[]
}

const getLogFile = (directory: string): LogFile => {
  const logFilePath = `${directory}/${LOG_FILE}`;
  const exists = fs.existsSync(logFilePath);
  const fileData = exists ? fs.readFileSync(logFilePath, 'utf8') : `{}`;
  return JSON.parse(fileData);
};

const writeLogFile = (
  saveFile: string,
  directory: string,
  logFile: Partial<LogFile>,
) => {
  const logFilePath = `${directory}/${LOG_FILE}`;
  logFile.lastRun = `${Date.now()}`;
  logFile.logFilePath = logFilePath;
  const runData = logFile.runs || [];
  runData.push({
    saveFile,
  });
  logFile.runs = runData;
  const saveData = JSON.stringify(logFile, null, 2);
  fs.writeFileSync(logFilePath, saveData);
};

const clearFolder = (logFile: LogFile, dir: string, preserveHistory?: boolean) => {
  const now = Date.now();
  const lastRun = logFile.lastRun || `${Date.now()}`;
  const difference = now - parseInt(lastRun, 10);

  if (difference > 10000  && !preserveHistory) {
    fs.readdirSync(dir).forEach((file) => {
      if (file === 'log.json') {
        return;
      }
      fs.unlinkSync(`${dir}/${file}`);
    });
  }
};

const saveAST = <
  T extends object,
  U extends string,
  V extends unknown[]
  >(config: SaveASTConfig<T, U, V>) => {
  const { node, directory, preserveHistory } = config;
  if (!node) {
    return;
  }
  const dir = directory || 'ast';
  const logFile = getLogFile(dir);
  const data = stringify(node, null, 2);
  const saveFile = `${dir}/${getPath(config)}`;
  clearFolder(logFile, dir, preserveHistory);

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  fs.writeFile(saveFile, data, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Saved AST to ${saveFile}`);
  });

  writeLogFile(saveFile, dir, logFile);
};

export default saveAST;
