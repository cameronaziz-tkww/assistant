import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import type { RouterConfig } from '../types';
import router from './router';
import getImport from './getImport';
import { astNodeGuards } from '../typeguards';
import variableInit from '../variableInit';

const handleImportClause = (
  config: RouterConfig,
  rootSource: ts.__String,
) => {
  const { node, init } = config;

  const importAST = getImport(config, rootSource);

  if (!importAST) {
    return node;
  }

  const sources = tsquery(importAST, `ExportAssignment`);

  const defaultExport = sources.find(
    (node): node is ts.ExportAssignment => !!node,
  );

  if (defaultExport) {
    config.node = defaultExport.expression;
    if (astNodeGuards.isIdentifier(defaultExport.expression)) {
      init.path.push(config.lastSource);
      const newNode = variableInit(defaultExport.expression.escapedText, config.astUtil);
      if (newNode) {
        config.node = newNode.node;
      }
    }
  }

  return router(config);
};

export default handleImportClause;
