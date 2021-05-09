import ts from 'typescript';
import type ASTUtil from './ASTUtil';

export interface RouterConfig {
  node: ts.Node | null;
  init: VariableInit;
  currentFile: string;
  astUtil: ASTUtil;
  lastSource: ts.__String,
}

export interface VariableInit {
  path: ts.__String[];
  node: ts.Node;
}

export type CompilerOptions = typeof ts.parseCommandLine extends (...args: any[])=> infer TResult ?
    TResult extends { options: infer TOptions } ? TOptions : never : never;
type TypeAcquisition = typeof ts.parseCommandLine extends (...args: any[])=> infer TResult ?
    TResult extends { typeAcquisition?: infer TTypeAcquisition } ? TTypeAcquisition : never : never;

export interface TSConfig {
  compilerOptions: CompilerOptions;
  exclude: string[];
  compileOnSave: boolean;
  extends: string;
  files: string[];
  include: string[];
  typeAcquisition: TypeAcquisition
};

export interface TypescriptConfiguration {
  tsConfig: TSConfig;
  path: string;
}

export interface ASTStorage {
  [filename: string]: ts.SourceFile;
}
