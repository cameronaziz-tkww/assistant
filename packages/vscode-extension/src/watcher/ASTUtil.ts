import { tsquery } from '@phenomnomnominal/tsquery';
import { fileSystem } from '@tkww-assistant/utils';
import fs from 'fs';
import ts from 'typescript';
import { filePaths } from '../utils';
import type { ASTStorage, TypescriptConfiguration, TSConfig, CompilerOptions } from './types';

const defaultOptions: CompilerOptions = {
  noEmit: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
};

class ASTUtil {
  private static instance: ASTUtil;
  private static typescriptConfigurations: TypescriptConfiguration[] = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private ASTs: ASTStorage = {};
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private AST: ts.SourceFile;
  public currentFile: string;

  private constructor(filename: string) {
    const ast = this.firstGet(filename);
    this.currentFile = filename;
    this.AST = ast;
  }

  public static getInstance(filename: string, fresh?: boolean): ASTUtil {
    if (!this.instance) {
      this.instance = new this(filename);
    }

    const ast = ASTUtil.getSource(filename);

    if (ast) {
      ASTUtil.instance.AST = ast;
      ASTUtil.instance.currentFile = filename;
    }

    return this.instance;
  };

  private firstGet = (filename: string, fresh?: boolean): ts.SourceFile => {
    const result = this.get(filename, fresh);

    if (!result) {
      throw new Error('Need an AST');
    }

    return result;
  };

  get current(): ts.SourceFile {
    return this.AST;
  }

  get = (filename: string, fresh?: boolean): ts.SourceFile | null => {
    this.currentFile = filename;

    const current = this.ASTs[filename];
    if (!fresh && current) {
      this.AST = current;
      return this.AST;
    }

    const sourceFile = ASTUtil.getSource(filename);

    if (sourceFile) {
      const { text } = sourceFile;
      const ast = tsquery.ast(text);
      this.ASTs[filename] = ast;
      this.AST = ast;
      return this.AST;
    }

    return null;
  };

  private static getSource = (filename: string): ts.SourceFile | null => {
    const options = ASTUtil.getOptions(filename);
    options.noEmit = true;
    const program = ts.createProgram([filename], options);
    return program.getSourceFile(filename) || null;
  };

  find = (filename: string): string => {
    const fileWithExtension = this.get(filename);
    if (fileWithExtension) {
      return filename;
    }

    const filenamePieces = filename.split('/');
    const fileNoExt = filenamePieces.pop();
    const fileParent = filenamePieces.join('/');
    const directory = fileSystem.readDirectorySync(fileParent);
    const fileFound = directory.find(([file]) => {
      const lastIndex = file.lastIndexOf('.');
      return fileNoExt === file.slice(0, lastIndex);
    });

    if (!fileFound) {
      const index = directory.find(([file]) => file.startsWith('index'));
      const file = `${filename}${index}`;
      this.get(file);
      return file;
    }
    const lastIndex = fileFound[0].lastIndexOf('.');
    const extension = fileFound[0].slice(lastIndex);
    const file = `${filename}${extension}`;
    this.get(file);
    return file;
  };

  private static findExisting = (path: string) => ASTUtil.typescriptConfigurations
    .find((typescriptConfiguration) =>
      typescriptConfiguration.path === path,
    );

  private static findTSConfigSync = (
    workspacePieces: string[],
    filePieces: string[],
  ): TSConfig | null => {
    if (filePieces.length < workspacePieces.length) {
      return null;
    }
    const path = `${filePieces.join('/')}/tsconfig.json`;
    const existing = ASTUtil.findExisting(path);

    if (existing) {
      return existing.tsConfig;
    }

    if (fs.existsSync(path)) {
      const json = fs.readFileSync(path, { encoding: 'utf8' });
      const tsConfig = JSON.parse(json);
      ASTUtil.typescriptConfigurations.push({
        path,
        tsConfig,
      });
      return tsConfig;
    }

    filePieces.pop();

    return ASTUtil.findTSConfigSync(workspacePieces, filePieces);
  };

  private static getOptions = (path: string): CompilerOptions => {
    const topDirectory = filePaths.getCurrentWorkspacePath();
    if (!topDirectory) {
      return defaultOptions;
    }
    const workspacePieces = topDirectory.uri.path.split('/');
    const filePieces = path.split('/');

    filePieces.pop();
    const tsConfig = ASTUtil.findTSConfigSync(workspacePieces, filePieces);
    if (!tsConfig) {
      return defaultOptions;
    }
    return tsConfig.compilerOptions;
  };
}

export default ASTUtil;
