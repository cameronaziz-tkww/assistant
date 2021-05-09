import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import type { RouterConfig } from '../types';
import router from './router';
import getImport from './getImport';
import { astNodeGuards } from '../typeguards';

const handleNamespaceImport = (
  config: RouterConfig,
  rootSource: ts.__String,
) => {
  const importAST = getImport(config, rootSource);

  if (!importAST) {
    return null;
  }

  const values = tsquery(importAST, `*:has([escapedText=${config.lastSource}])`);
  const newNode = values.find(
    (node): node is ts.VariableDeclaration =>
      astNodeGuards.isVariableDeclaration(node),
  );

  if (newNode && newNode.initializer) {
    config.node = newNode.initializer;
  }

  return router(config);
};

export default handleNamespaceImport;
