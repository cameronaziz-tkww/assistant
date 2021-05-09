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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private ASTs: ASTStorage = {};
  private typescriptConfigurations: TypescriptConfiguration[] = [];

  get = (filename: string, fresh?: boolean): ts.SourceFile | null => {
    if (!fresh && this.ASTs[filename]) {
      return this.ASTs[filename];
    }

    const options = this.getOptions(filename);
    options.noEmit = true;
    const program = ts.createProgram([filename], options);
    const sourceFile = program.getSourceFile(filename);

    if (!sourceFile) {
      return null;
    }

    const { text } = sourceFile;
    const ast = tsquery.ast(text);
    this.ASTs[filename] = ast;

    return ast;
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

  private findExisting = (path: string) => this.typescriptConfigurations
    .find((typescriptConfiguration) =>
      typescriptConfiguration.path === path,
    );

  private findTSConfigSync = (
    workspacePieces: string[],
    filePieces: string[],
  ): TSConfig | null => {
    if (filePieces.length < workspacePieces.length) {
      return null;
    }
    const path = `${filePieces.join('/')}/tsconfig.json`;
    const existing = this.findExisting(path);

    if (existing) {
      return existing.tsConfig;
    }

    if (fs.existsSync(path)) {
      const json = fs.readFileSync(path, { encoding: 'utf8' });
      const tsConfig = JSON.parse(json);
      this.typescriptConfigurations.push({
        path,
        tsConfig,
      });
      return tsConfig;
    }

    filePieces.pop();

    return this.findTSConfigSync(workspacePieces, filePieces);
  };

  private getOptions = (path: string): CompilerOptions => {
    const topDirectory = filePaths.getCurrentWorkspacePath();
    if (!topDirectory) {
      return defaultOptions;
    }
    const workspacePieces = topDirectory.uri.path.split('/');
    const filePieces = path.split('/');

    filePieces.pop();
    const tsConfig = this.findTSConfigSync(workspacePieces, filePieces);
    if (!tsConfig) {
      return defaultOptions;
    }
    return tsConfig.compilerOptions;
  };
}

export default ASTUtil;
