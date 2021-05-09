import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import type { RouterConfig } from '../types';
import { removeMaybeOuter } from '../util';

const handleImport = (
  config: RouterConfig,
  rootSource: ts.__String,
) => {
  const { astUtil } = config;
  const { currentFile, current } = astUtil;

  const filePath = currentFile.split('/');
  filePath.pop();
  const declarations = tsquery(current, `ImportDeclaration:has([escapedText=${rootSource}])`) as ts.ImportDeclaration[];

  declarations.some(
    (declaration) => {
      const source = removeMaybeOuter(declaration.moduleSpecifier.getText());
      if (!source.startsWith('.')) {
        return true;
      }
      if (source.startsWith('./')) {
        const sourceFilePath = `${filePath.join('/')}/${source.replace('./', '')}`;
        astUtil.find(sourceFilePath);
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
      astUtil.find(sourceFilePath);
      return true;
    }
  );

  return astUtil.current;
};

export default handleImport;
