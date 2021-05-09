import micromatch from 'micromatch';
import { ShouldRun } from '../types';
import getUserSetting from './getUserSetting';
import { PLUGIN_NAME, FILE_LOCATION_GLOBS, BASE_FILE_LOCATION } from './constants';
import log from './log';
import * as Types from '../types';

const pendingMessages = new Map();

const sendError = <T extends ShouldRun.Context>(context: T, type: Types.RuleType, roots: any) => {
  const { id } = context;

  if (!pendingMessages.has(id)) {
    const message = [
      `No Project Roots Provided for ${id}`,
      'Expected the following in ESLint config\n',
      '"settings": {',
      `  "${PLUGIN_NAME}": {`,
      `    "${type}": Array<string>`,
      '  }',
      '}\n',
      `Found: ${typeof roots}. ${id} will not be ran.`,
      'Feel free to Slack Cameron Aziz if help is needed.\n',
    ];
    pendingMessages.set(id, message);
  }
};

process.on('exit', () => {
  if (pendingMessages.size === 0) {
    return;
  }
  pendingMessages.forEach((message) => {
    log({
      message,
      logCode: Types.CODE.ERROR,
      nlAfterHeading: true,
    });
  });
});

const getProjectRoots = <T extends ShouldRun.Context>(context: T, type: Types.RuleType) => {
  const { options } = context;
  if (options) {
    const globalSchemaOption = options[options.length - 1] as Types.Options.GlobalSchema;
    if (globalSchemaOption?.projectRoots) {
      return globalSchemaOption.projectRoots;
    }
  }
  const roots = getUserSetting(context, type);

  const isValidArray = roots && Array.isArray(roots) && roots.every((root) => typeof root === 'string');
  if (isValidArray && roots) {
    return roots;
  }

  sendError(context, type, roots);
  return null;

};

const rawToModuleName = (rawModuleName?: string) =>
  rawModuleName
    ? `${rawModuleName[0].toUpperCase()}${rawModuleName.slice(1)}`
    : '';

const getFileAndExtension = (filenamePathPieces: string[]) => {
  const filenameRaw = filenamePathPieces[filenamePathPieces.length - 1];
  const filenamePieces = filenameRaw.split('.');
  return {
    fileExtension: filenamePieces[filenamePieces.length - 1].toLowerCase(),
    filename: filenamePieces[0],
  };
};

const getModuleName = (config: ShouldRun.GetModuleNameConfig): ShouldRun.GetModuleNameResult => {
  const { matchResult, filenamePathPieces, moduleIsFile, isMatchedFile, rawFilename } = config;

  if (typeof matchResult === 'undefined') {
    if (isMatchedFile) {
      return exactMatch(rawFilename);
    }
    return {
      moduleNameRaw: '',
      moduleName: '',
      fileExtension: '',
    };
  }

  const { fileExtension, filename } = getFileAndExtension(filenamePathPieces);
  if (moduleIsFile) {
    return {
      moduleNameRaw: filename,
      moduleName: rawToModuleName(filename),
      fileExtension,
    };
  }

  const moduleNameRaw = matchResult ? matchResult[0] : '';
  return {
    moduleNameRaw,
    moduleName: rawToModuleName(moduleNameRaw),
    fileExtension,
  };
};

// context.getCwd is not typed, smh
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const getWorkingDirectory = <T extends Context>(context: T): string => context.getCwd();

const exactMatch = (rawFilePath: string) => {
  const filenamePathPieces = rawFilePath.split('/');
  const moduleNameRaw = filenamePathPieces[filenamePathPieces.length - 2];
  const { fileExtension } = getFileAndExtension(filenamePathPieces);
  return {
    moduleNameRaw,
    moduleName: rawToModuleName(moduleNameRaw),
    fileExtension,
  };
};

const addTo = (base: string[], adds: string | string[]) =>
  Array.isArray(adds) ? base.push(...adds) : base.push(adds);

const getGlobs = (config: ShouldRun.GetGlobsConfig): Types.FileLocation => {
  const { globPatterns, consumerOptions } = config;
  const systemGlob = FILE_LOCATION_GLOBS[globPatterns];
  if (!consumerOptions) {
    return systemGlob;
  }
  const { runOn, excludeDefault } = consumerOptions;

  const fileLocation = excludeDefault ? BASE_FILE_LOCATION : systemGlob;

  if (runOn) {
    if (runOn.include) {
      addTo(fileLocation.match, runOn.include);
    }
    if (runOn.ignore) {
      fileLocation.ignore = fileLocation.ignore || [];
      addTo(fileLocation.ignore, runOn.ignore);
    }
  }
  return fileLocation;
};

const breakFilename = (config: ShouldRun.BreakFilenameConfig) => {
  const { rawFilename, replacer } = config;
  const filename = rawFilename.replace(replacer, '');
  const filenamePathPieces = filename.split('/');
  const file = filenamePathPieces[filenamePathPieces.length - 1];

  return {
    filename,
    filenamePathPieces,
    file,
  };
};

const determineShouldRun = <T extends ShouldRun.Context>(
  config: ShouldRun.Config<T>,
): Types.FileMatch | null => {
  const {
    context,
    globPatterns,
    moduleIsFile,
    consumerOptions,
  } = config;
  const workingDirectory = getWorkingDirectory(context);
  const searchLocations = getGlobs({
    globPatterns,
    consumerOptions,
  });
  const rawFilename = context.getFilename();
  const projectRoots = getProjectRoots(context, searchLocations.ruleType);

  if (!projectRoots) {
    return null;
  }

  const fullProjectRoots = projectRoots
    .map(
      (projectRoot) => {
        const leading = projectRoot.startsWith('/') ? '' : '/';
        const trailing = projectRoot.endsWith('/') ? '' : '/';
        return `${workingDirectory}${leading}${projectRoot}${trailing}`;
      },
    );

  const allResults = fullProjectRoots
    .map((fullProjectRoot) => {
      if (searchLocations.ignore) {
        const ignores = searchLocations.ignore
          ? searchLocations.ignore.map((ignored) => `${fullProjectRoot}${ignored}`)
          : [];
        const isIgnored = micromatch.isMatch(rawFilename, ignores);
        if (isIgnored) {
          return [];
        }
      }

      const result = searchLocations.match.map((match) =>
        micromatch.capture(`${fullProjectRoot}${match}`, rawFilename),
      );
      return result;
    })
    .reduce(
      (acc, cur) => {
        acc.push(...cur);
        return acc;
      },
      [],
    )
    .filter((result): result is string[] => typeof result !== 'undefined' && result !== null);

  const isMatchedFile = allResults.length > 0;
  const matchResult = allResults[0];
  const matchRoot = fullProjectRoots.find(
    (fullProjectRoot) => rawFilename.startsWith(fullProjectRoot),
  ) || '';

  const {
    filenamePathPieces,
    file,
    filename,
  } = breakFilename({
    replacer: matchRoot,
    rawFilename,
  });

  const { moduleName, moduleNameRaw, fileExtension } = getModuleName({
    matchResult,
    filenamePathPieces,
    moduleIsFile,
    patterns: searchLocations.match,
    isMatchedFile,
    rawFilename,
  });

  const result = {
    isMatchedFile,
    file,
    matchResult,
    allResults,
    filename,
    moduleNameRaw,
    moduleName,
    filenamePathPieces,
    fileExtension,
    filenamePieces: filenamePathPieces,
  };

  return result;
};

export default determineShouldRun;
