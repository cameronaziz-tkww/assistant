import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
import { PropertyNamesOnly } from '../../types';
import findParent from '../findParent';
import runAlwaysBreak from './runAlwaysBreak';
import runBreakOneBreakAll from './runBreakOneBreakAll';
import runConsistentBreaks from './runConsistentBreaks';
import runConsistentSpacing from './runConsistentSpacing';
import runIsTooWide from './runIsTooWide';
import * as Types from './types';

const run = <
  T extends TSESTree.Node,
  U extends PropertyNamesOnly<T>
>(config: Types.RunConfig<T, U>) => {
  const { options, node, declarationType } = config;
  const attributeOptions = options[declarationType];
  const parentNode = findParent(node, AST_NODE_TYPES.TSTypeAliasDeclaration);
  const startingLine = parentNode?.loc.start.line || node.loc.start.line;

  const runTaskConfig = {
    ...config,
    attributeOptions,
    startingLine,
  };

  if(attributeOptions.maxLength) {
    const maxLength = runIsTooWide(runTaskConfig);
    if (maxLength) {
      return;
    }
  }

  if (attributeOptions.consistentBreaks) {
    const consistentSpacing = runConsistentSpacing(runTaskConfig);
    if (consistentSpacing) {
      return;
    }
  }

  if (attributeOptions.consistentBreaks) {
    const consistentBreaks = runConsistentBreaks(runTaskConfig);
    if (consistentBreaks) {
      return;
    }
  }

  if (attributeOptions.breakOneBreakAll) {
    const breakOneBreakAll = runBreakOneBreakAll(runTaskConfig);
    if (breakOneBreakAll) {
      return;
    }
  }

  if (attributeOptions.alwaysBreak) {
    runAlwaysBreak(runTaskConfig);
  }
};

export default run;
