import ts from 'typescript';

class AST {
  sourceFile: ts.SourceFile;
  constructor(sourceFile: ts.SourceFile) {
    this.sourceFile = sourceFile;
  }

  children = () => {

  };
}

// const getMember = (value: ts.SyntaxKind): string | null => {
//   for (var enumMember in ts.SyntaxKind) {
//     if (enumMember === ts.SyntaxKind[value]) {
//       return enumMember;
//     }
//   }
//   return null;
// };

// function report(
//   node: ts.Node,
//   sourceFile: ts.SourceFile,
//   message?: string
// ) {
//   const member = getMember(node.kind);
//   const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
//   console.log(`${member}: (${line + 1},${character + 1})${message ? ': ' : ''}${message || ''}`);
// }
// function delint(sourceFile: ts.SourceFile) {
//   delintNode(sourceFile);

//   function delintNode(node: ts.Node) {
//     switch (node.kind) {
//       case ts.SyntaxKind.ExportAssignment:
//         report(
//           node,
//           sourceFile,
//         );
//         break;
//       case ts.SyntaxKind.ForStatement:
//       case ts.SyntaxKind.ForInStatement:
//       case ts.SyntaxKind.WhileStatement:
//       case ts.SyntaxKind.DoStatement:
//         if ((node as ts.IterationStatement).statement.kind !== ts.SyntaxKind.Block) {
//           report(
//             node,
//             sourceFile,
//             'A looping statement\'s contents should be wrapped in a block body.',
//           );
//         }
//         break;

//       case ts.SyntaxKind.IfStatement:
//         const ifStatement = node as ts.IfStatement;
//         if (ifStatement.thenStatement.kind !== ts.SyntaxKind.Block) {
//           report(
//             ifStatement.thenStatement,
//             sourceFile,
//             'An if statement\'s contents should be wrapped in a block body.',
//           );
//         }
//         if (
//           ifStatement.elseStatement &&
//           ifStatement.elseStatement.kind !== ts.SyntaxKind.Block &&
//           ifStatement.elseStatement.kind !== ts.SyntaxKind.IfStatement
//         ) {
//           report(
//             ifStatement.elseStatement,
//             sourceFile,
//             'An else statement\'s contents should be wrapped in a block body.'
//           );
//         }
//         break;

//       case ts.SyntaxKind.BinaryExpression:
//         const op = (node as ts.BinaryExpression).operatorToken.kind;
//         if (op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsToken) {
//           report(
//             node,
//             sourceFile,
//             'Use \'===\' and \'!==\'.');
//         }
//         break;
//     }

//     ts.forEachChild(node, delintNode);
//   }
// }

const create = (sourceFile?: ts.SourceFile): AST | null => {
  if (!sourceFile) {
    return null;
  }

  return new AST(sourceFile);
};

export default create;
