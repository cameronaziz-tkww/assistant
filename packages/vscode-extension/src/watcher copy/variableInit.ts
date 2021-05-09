import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import { astNodeGuards } from './typeguards';
import type { VariableInit } from './types';

const findPath = (expression: ts.LeftHandSideExpression, path: ts.__String[] = []): VariableInit | null => {
  if (astNodeGuards.isIdentifier(expression)) {
    path.push(expression.escapedText);
    return {
      path,
      node: expression,
    };
  }

  if (astNodeGuards.isPropertyAccessExpression(expression)) {
    path.push(expression.name.escapedText);
    return findPath(expression.expression, path);
  }

  return null;
};

const variableInit = (
  name: string | ts.__String,
  ast: ts.SourceFile,
): VariableInit | null => {
  const variables = tsquery(ast, `VariableDeclaration:has([escapedText="${name}"])`) as ts.VariableDeclaration[];

  return variables
    .map(
      (variable) => {
        const { initializer } = variable;
        if (!initializer) {
          return null;
        }
        if (astNodeGuards.isIdentifier(initializer)) {
          return {
            path: [initializer.escapedText],
            node: initializer,
          };
        }

        if (astNodeGuards.isPropertyAccessExpression(initializer)) {
          return findPath(initializer);
        }

        if (astNodeGuards.isObjectLiteralExpression(initializer)) {
          return {
            path: [],
            node: initializer,
          };
        }
        return null;
      },
    )
    .find((node): node is VariableInit => node !== null) || null;
};

export default variableInit;
