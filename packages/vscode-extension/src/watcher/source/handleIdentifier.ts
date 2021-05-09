// import { tsquery } from '@phenomnomnominal/tsquery';
// import ts from 'typescript';
// import type ASTUtil from '../ASTUtil';
// import type { VariableInit } from '../types';
// import router from './router';

// const findSource = (
//   init: VariableInit,
//   astUtil: ASTUtil,
//   currentFile: string,
// ): ts.Node | null => {
//   const ast = astUtil.get(currentFile);

//   if (!ast) {
//     return null;
//   }
//   const rootSource = init.path.pop();

//   if (!rootSource) {
//     return null;
//   }

//   const sources = tsquery(ast, `Identifier[escapedText="${rootSource}"]`) as ts.Identifier[];
//   const lastSource = rootSource;
//   console.log('~ rootSource lastSource', lastSource);
//   return sources.map(
//     (source) => router({
//       node: source.parent,
//       init,
//       lastSource,
//       currentFile,
//       astUtil,
//     }))
//     .find((node): node is ts.Node => node !== null) || null;
// };

// export default findSource;
