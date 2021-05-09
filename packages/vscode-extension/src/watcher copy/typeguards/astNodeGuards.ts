import ts from 'typescript';

export const isIdentifier = (unknown?: ts.Node): unknown is ts.Identifier =>
  unknown?.kind === ts.SyntaxKind.Identifier;

export const isPropertyAccessExpression = (unknown?: ts.Node): unknown is ts.PropertyAccessExpression =>
  unknown?.kind === ts.SyntaxKind.PropertyAccessExpression;

export const isVariableDeclaration = (unknown?: ts.Node): unknown is ts.VariableDeclaration =>
  unknown?.kind === ts.SyntaxKind.VariableDeclaration;

export const isNamespaceImport = (unknown?: ts.Node): unknown is ts.NamespaceImport =>
  unknown?.kind === ts.SyntaxKind.NamespaceImport;

export const isImportClause = (unknown?: ts.Node): unknown is ts.ImportClause =>
  unknown?.kind === ts.SyntaxKind.ImportClause;

export const isObjectLiteralExpression = (unknown?: ts.Node | null): unknown is ts.ObjectLiteralExpression =>
  unknown?.kind === ts.SyntaxKind.ObjectLiteralExpression;

// Has Helpers
type HasNameIdentifier<T extends ts.Node> = T & {
  readonly name: ts.Identifier;
};

type HasNameNode<T extends ts.Node> = T & {
  readonly name: ts.Node;
};

export const hasNameIdentifier = <T extends ts.Node>(unknown?: T | null): unknown is HasNameIdentifier<T> =>
  !!unknown
    && typeof (unknown as HasNameNode<T>).name !== 'undefined'
    && isIdentifier((unknown as HasNameNode<T>).name);
