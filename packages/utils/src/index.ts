export { default as accessors } from './accessors';
export { default as color } from './color';
export { default as constants } from './constants';
export { default as fileSystem } from './fileSystem';
export { default as important } from './important';
export { default as log } from './log';
export { default as time } from './time';
export { default as parseDocument } from './parseDocument';
export { default as recurseHas } from './recurseHas';
export { default as typeGuards } from './typeGuards';
export { default as validCSS } from './validCSS';

export declare namespace Log {
  enum Level {
    Info = 0,
    Warning = 1,
    Error = 2
  }

  interface Logger {
    (message: string, level?: Level): void;
  }

  interface Config extends Options {
    level: Level;
  }

  interface Options {
    logger?: Logger;
    inDevelopment?: boolean;
    noTimestamp?: boolean;
  }
}

export declare namespace Dependency {
  interface DependencyVersion {
    dependencyName: string;
    dependencyOrganization?: string;
    versionRange: string;
  }

  interface DependencyName {
    dependency: string;
    versionRange: string;
  }
}

export declare namespace FileSystem {
  enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 64
  }

  type Directory = [path: string, fileType: FileType];

  interface ReadDirectoryCallback {
    (path: string): Promise<Directory[]>;
  }

  interface ReadFileCallback {
    (path: string): Promise<Uint8Array>;
  }

  interface FindFilesCallback {
    (pattern: string, cwd: string): Promise<string[]>;
  }

  interface ReadCallbacks {
    directory?: ReadDirectoryCallback;
    file?: ReadFileCallback;
    findFiles?: FindFilesCallback;
  }
}

export declare namespace Constants {
  interface NumberFactor {
    [identifierValue: string]: number
  }
}

export declare namespace Colors {
  interface RGB {
    r: number;
    g: number;
    b: number;
  }
  interface HexToRGB {
    <T = true>(hex: string, toString: true): T extends true ? string : RGB;
    <T = false>(hex: string, toString?: false): T extends true ? string : RGB;
    <T = number>(hex: string, opacity: T): T extends number ? string : RGB;
  }
  interface HSL {
    h: number;
    s: number;
    l: number;
  }

  interface RBGToHSL {
    <T = true>(rgb: RGB, toObject: true): T extends true ? HSL : string;
    <T = false>(rgb: RGB, toObject?: false): T extends true ? HSL : string;
  }

  interface HexToHSL {
    <T = true>(hex: string, toObject: true): T extends true ? HSL : string;
    <T = false>(hex: string, toObject?: false): T extends true ? HSL : string;
  }

  type Unchanged <T extends object> = {
    [key in keyof T]: T[key];
  }

  type ToHexParam <T extends object> = number | Unchanged<T>;
}
