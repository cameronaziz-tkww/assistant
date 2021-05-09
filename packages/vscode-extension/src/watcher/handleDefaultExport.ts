import { tsquery } from '@phenomnomnominal/tsquery';
import ts from 'typescript';
import type ASTUtil from './ASTUtil';
import { astNodeGuards } from './typeguards';
import variableInit from './variableInit';

const handleDefaultExport = (astUtil: ASTUtil) => {
  const { current } = astUtil;
  const sources = tsquery(current, `ExportAssignment`);
  console.log('~ sources', sources);

  if (sources.length > 1) {

  }

  sources.forEach((source) => {
    console.log(source);
  });
  const defaultExport = sources.find(
    (node): node is ts.ExportAssignment => !!node,
  );
  console.log('~ defaultExport', defaultExport);

  // if (defaultExport) {
  //   config.node = defaultExport.expression;
  //   if (astNodeGuards.isIdentifier(defaultExport.expression)) {
  //     init.path.push(config.lastSource);
  //     const newNode = variableInit(defaultExport.expression.escapedText, importAST);
  //     if (newNode) {
  //       config.node = newNode.node;
  //     }
  //   }
  // }
};

export default handleDefaultExport;

