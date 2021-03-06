const camelcase = [
  'ArrayExpression',
  'ArrayPattern',
  'ArrowFunctionExpression',
  'AssignmentPattern',
  'AssignmentExpression',
  'AwaitExpression',
  'BigIntLiteral',
  'BinaryExpression',
  'BlockStatement',
  'BreakStatement',
  'CallExpression',
  'CatchClause',
  'ChainExpression',
  'ClassBody',
  'ClassDeclaration',
  'ClassExpression',
  'ClassProperty',
  'Comment',
  'ConditionalExpression',
  'ContinueStatement',
  'DebuggerStatement',
  'Decorator',
  'DoWhileStatement',
  'EmptyStatement',
  'ExportAllDeclaration',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ExportSpecifier',
  'ExpressionStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'FunctionDeclaration',
  'FunctionExpression',
  'Identifier',
  'IfStatement',
  'ImportDeclaration',
  'ImportDefaultSpecifier',
  'ImportExpression',
  'ImportNamespaceSpecifier',
  'ImportSpecifier',
  'JSXAttribute',
  'JSXClosingElement',
  'JSXClosingFragment',
  'JSXElement',
  'JSXEmptyExpression',
  'JSXExpressionContainer',
  'JSXFragment',
  'JSXIdentifier',
  'JSXMemberExpression',
  'JSXOpeningElement',
  'JSXOpeningFragment',
  'JSXSpreadAttribute',
  'JSXSpreadChild',
  'JSXText',
  'LabeledStatement',
  'Literal',
  'LogicalExpression',
  'MemberExpression',
  'MetaProperty',
  'MethodDefinition',
  'NewExpression',
  'ObjectExpression',
  'ObjectPattern',
  'Program',
  'Property',
  'RestElement',
  'ReturnStatement',
  'SequenceExpression',
  'SpreadElement',
  'Super',
  'SwitchCase',
  'SwitchStatement',
  'TaggedTemplateExpression',
  'TemplateElement',
  'TemplateLiteral',
  'ThisExpression',
  'ThrowStatement',
  'Token',
  'TryStatement',
  'TSAbstractClassProperty',
  'TSAbstractKeyword',
  'TSAbstractMethodDefinition',
  'TSAnyKeyword',
  'TSArrayType',
  'TSAsExpression',
  'TSAsyncKeyword',
  'TSBigIntKeyword',
  'TSBooleanKeyword',
  'TSCallSignatureDeclaration',
  'TSClassImplements',
  'TSConditionalType',
  'TSConstructorType',
  'TSConstructSignatureDeclaration',
  'TSDeclareKeyword',
  'TSDeclareFunction',
  'TSEmptyBodyFunctionExpression',
  'TSEnumDeclaration',
  'TSEnumMember',
  'TSExportAssignment',
  'TSExportKeyword',
  'TSExternalModuleReference',
  'TSFunctionType',
  'TSImportEqualsDeclaration',
  'TSImportType',
  'TSIndexedAccessType',
  'TSIndexSignature',
  'TSInferType',
  'TSInterfaceBody',
  'TSInterfaceDeclaration',
  'TSInterfaceHeritage',
  'TSIntersectionType',
  'TSLiteralType',
  'TSMappedType',
  'TSMethodSignature',
  'TSModuleBlock',
  'TSModuleDeclaration',
  'TSNamespaceExportDeclaration',
  'TSNeverKeyword',
  'TSNonNullExpression',
  'TSNullKeyword',
  'TSNumberKeyword',
  'TSObjectKeyword',
  'TSOptionalType',
  'TSParameterProperty',
  'TSParenthesizedType',
  'TSPrivateKeyword',
  'TSPropertySignature',
  'TSProtectedKeyword',
  'TSPublicKeyword',
  'TSQualifiedName',
  'TSReadonlyKeyword',
  'TSRestType',
  'TSStaticKeyword',
  'TSStringKeyword',
  'TSSymbolKeyword',
  'TSThisType',
  'TSTupleType',
  'TSTypeAliasDeclaration',
  'TSTypeAnnotation',
  'TSTypeAssertion',
  'TSTypeLiteral',
  'TSTypeOperator',
  'TSTypeParameter',
  'TSTypeParameterDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypePredicate',
  'TSTypeQuery',
  'TSTypeReference',
  'TSUndefinedKeyword',
  'TSUnionType',
  'TSUnknownKeyword',
  'TSVoidKeyword',
  'UnaryExpression',
  'UpdateExpression',
  'VariableDeclaration',
  'VariableDeclarator',
  'WhileStatement',
  'WithStatement',
  'YieldExpression',
];

const regex = camelcase
  .reduce(
    (acc, cur) => {
      return `${acc}|${cur}|${cur}:exit`;
    },
    '',
  )
  .slice(1);

module.exports = regex;
