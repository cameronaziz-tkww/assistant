import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../typeguards';
import * as Types from '../types/exportDeclarations';
import { NodeWithType } from '../types/NodeHelperTypes';

const isFunctionDeclaration = (unknown?: NodeWithType | null): unknown is TSESTree.FunctionDeclaration =>
  unknown?.type === AST_NODE_TYPES.FunctionDeclaration;

const buildParameter = <T extends TSESTree.Parameter>(param: T, name?: string): Types.Parameter => ({
  name: name || null,
  node: param,
});

const analyzeRest = (param: TSESTree.RestElement): Types.Parameter =>
  typeguards.isIdentifier(param.argument) ? buildParameter(param, param.argument.name) : buildParameter(param);

const analyzeNotIdentifier = (param: TSESTree.Parameter): Types.Parameter =>
  typeguards.isRestElement(param) ? analyzeRest(param) : buildParameter(param);

const analyzeParam = (param: TSESTree.Parameter): Types.Parameter =>
  typeguards.isIdentifier(param) ? buildParameter(param, param.name) : analyzeNotIdentifier(param);

const analyzeParams = (params: TSESTree.Parameter[]): Types.Parameter[] =>
  params.map((param) => analyzeParam(param));

const analyzeReturnStatement = ({ argument }: TSESTree.ReturnStatement): Types.Parameter[] | null =>
  typeguards.isArrowFunctionExpression(argument) || typeguards.isFunctionExpression(argument)
    ? analyzeParams(argument.params)
    : null;

const analyzeStatement = (statement: TSESTree.Statement): Types.Parameter[] | null =>
  typeguards.isReturnStatement(statement) ? analyzeReturnStatement(statement) : null;

const buildStatement = (statement: TSESTree.Statement) => ({
  node: statement,
  parameters: analyzeStatement(statement) || [],
  hasDispatched: false,
});

const buildBlockStatement = (block: TSESTree.BlockStatement): Types.ReturnStatement | null =>
  block.body
    .map<Types.ReturnStatement>(buildStatement)
    .find((statement) => statement.parameters.length !== 0) || null;

const buildNestedArrowFunction = (body: TSESTree.ArrowFunctionExpression) => ({
  node: body,
  parameters: analyzeParams(body.params),
  hasDispatched: false,
});

const analyzeBlockArrow = (body: TSESTree.ArrowFunctionExpression | TSESTree.BlockStatement) =>
  typeguards.isArrowFunctionExpression(body) ? buildNestedArrowFunction(body) : buildBlockStatement(body);

const analyzeArrowFunctionExpression = ({ body }: TSESTree.ArrowFunctionExpression) =>
  typeguards.isArrowFunctionExpression(body) || typeguards.isBlockStatement(body) ? analyzeBlockArrow(body) : null;

const analyzeVariableDeclarator = ({ init }: TSESTree.VariableDeclarator): Types.ReturnStatement | null =>
  typeguards.isArrowFunctionExpression(init) ? analyzeArrowFunctionExpression(init) : null;

const buildWrapper = (body: TSESTree.BlockStatement): Types.ExportDeclarationWrapper => {
  const declarationWrapper = buildBlockStatement(body);
  if (declarationWrapper) {
    return {
      declarationKind: Types.ExportDeclarationKind.Function,
      declarationWrapper,
    };
  }
  return null;
};

const analyzeFunctionDeclaration = ({ body }: TSESTree.FunctionDeclaration): Types.ExportDeclarationWrapper =>
  typeguards.isBlockStatement(body) ? buildWrapper(body) : null;

const buildDeclarationResult = (declaration: TSESTree.VariableDeclaration) =>
  declaration.declarations
    .map(analyzeVariableDeclarator)
    .filter((returnStatement): returnStatement is Types.ReturnStatement =>
      returnStatement !== null,
    );

const builtVariableDeclaration = (declaration: TSESTree.VariableDeclaration): Types.ExportDeclarationWrapper => ({
  declarationKind: Types.ExportDeclarationKind.Arrow,
  declarationWrappers: buildDeclarationResult(declaration),
});

const analyzeAllowedTypes = (declaration: TSESTree.VariableDeclaration | TSESTree.FunctionDeclaration): Types.ExportDeclarationWrapper =>
  typeguards.isVariableDeclaration(declaration) ? builtVariableDeclaration(declaration) : analyzeFunctionDeclaration(declaration);

const analyzeExportDeclaration = (declaration: TSESTree.ExportDeclaration | null): Types.ExportDeclarationWrapper =>
  typeguards.isVariableDeclaration(declaration) || isFunctionDeclaration(declaration)
    ? analyzeAllowedTypes(declaration)
    : null;

export default analyzeExportDeclaration;
