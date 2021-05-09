import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import type { RouterConfig } from '../types';
import { removeMaybeOuter } from '../util';

const handleImport = (
  config: RouterConfig,
  rootSource: ts.__String,
) => {
  const { currentFile, astUtil } = config;
  const ast = astUtil.get(currentFile);
  if (!ast) {
    return null;
  }
  const filePath = currentFile.split('/');
  filePath.pop();
  const declarations = tsquery(ast, `ImportDeclaration:has([escapedText=${rootSource}])`) as ts.ImportDeclaration[];

  declarations.some(
    (declaration) => {
      const source = removeMaybeOuter(declaration.moduleSpecifier.getText());
      if (!source.startsWith('.')) {
        return true;
      }
      if (source.startsWith('./')) {
        const sourceFilePath = `${filePath.join('/')}/${source.replace('./', '')}`;
        const currentFile = astUtil.find(sourceFilePath);
        config.currentFile = currentFile;
        return true;
      }
      const sourcePieces = source.split('/');
      const levels = sourcePieces.findIndex((piece) => piece !== '..');
      filePath.length = filePath.length - levels;
      const sourceFilePath = `${
        filePath.join('/')
      }/${
        sourcePieces.slice(levels)
          .join('/')
      }`;
      const currentFile = astUtil.find(sourceFilePath);
      config.currentFile = currentFile;
      return true;
    }
  );
  return astUtil.get(config.currentFile);
};

export default handleImport;
