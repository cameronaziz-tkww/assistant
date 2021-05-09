import { FileSystem, Log } from '@tkww-assistant/utils';
import { Node, QueryWrapper, ValueType } from 'query-ast';

export { StylesheetNodeType } from 'scss-parser';
export { default as buildDependencies } from './buildDependencies';
export { default as findPackageJSON } from './findPackageJSON';
export { default as getImports } from './getImports';
export { default as helpers } from './helpers';
export { default as merge } from './merge';

export interface StandardOptions {
  readCallbacks?: FileSystem.ReadCallbacks;
  logger?: Log.Logger;
  inDevelopment?: boolean;
}

// Need to remove atrule
export type Schema = 'dependencies' | 'value' | 'dependencyName' | 'dependency' | 'file' |'fileLocation' |'rules' | 'rule' | 'from' | 'settings' | 'is_case_insensitive' | 'do_not_convert';
export type SchemaDependency = 'dependencies' | 'dependency' | 'name' | 'version' | 'path';
export type SchemaType = SchemaDependency | ValueType;
export type SchemaNodeType = ValueType | Schema;

export namespace ReadPackageJSON {
  interface Fail {
    pkg: undefined
    path: string
    error: string
  }

  export interface Success {
    pkg: PackageJSON
    path: string
    error: undefined
  }

  export type Response = Success | Fail;
}


export interface BuildPackageJSONConfig {
  dependency: string;
  path: string;
  workspacePath: string;
  options?: StandardOptions;
}

export namespace FindPackageJSON {
  export interface Config {
    path: string;
    dependencyNames: string[]
    options?: StandardOptions;
  }

  export type Response = Fail | Success;

  export interface Fail {
    foundDependencies: [];
  }

  export interface Success {
    packageJSON: ReadPackageJSON.Success;
    foundDependencies: string[];
  }
}

export interface PackageJSON {
  name: string;
  version: string;
  files?: string[];
  dependencies?: {
    [packageName: string]: string;
  };
}

export interface DependencyFile {
  location: string
  content: string
}

export interface HexVariables {
  [variable: string]: string
}

export interface DependencyVersion {
  dependencyName: string
  dependencyOrganization?: string
  versionRange: string
}

export interface NewDependency {
  dependencyName: string
  values: Node<ValueType>[]
}

export interface DependencyImportLocation<T extends {}> {
  dependencyImport: string
  wrapper: QueryWrapper<SchemaNodeType, T>
}
