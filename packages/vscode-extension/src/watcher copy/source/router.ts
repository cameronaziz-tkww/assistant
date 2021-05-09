import ts from 'typescript';
import handleExpression from './handleExpression';
import handleImportClause from './handleImportClause';
import handleNamespaceImport from './handleNamespaceImport';
import handleObjectLiteralExpression from './handleObjectLiteralExpression';
import { astNodeGuards } from '../typeguards';
import type { RouterConfig } from '../types';

const router = (config: RouterConfig): ts.Node | null => {
  const { node, init } = config;
  const source = init.path.pop();

  if (!source) {
    return node;
  }

  config.lastSource = source;

  if (astNodeGuards.isObjectLiteralExpression(node)) {
    return handleObjectLiteralExpression(config, node);
  }

  if (!astNodeGuards.hasNameIdentifier(node)) {
    return node;
  }

  if (
    astNodeGuards.isVariableDeclaration(node)
  && node.name.escapedText === source
  ) {
    const { initializer } = node;
    if (!initializer) {
      return null;
    }
    config.node = initializer;
    return handleExpression(config);
  }

  // Defualt imports
  if (astNodeGuards.isImportClause(node)) {
    return handleImportClause(config, node.name.escapedText);
  }

  if (astNodeGuards.isNamespaceImport(node)) {
    return handleNamespaceImport(
      config,
      node.name.escapedText,
    );
  }

  return null;
};

export default router;
