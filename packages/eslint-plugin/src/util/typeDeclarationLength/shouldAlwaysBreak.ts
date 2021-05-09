import { TSESTree } from '@typescript-eslint/experimental-utils';
import { DEFAULT_ALWAYS_BREAK_AT } from './constants';
import { AttributeOptions } from './types';

const shouldAlwaysBreak = (
  options: AttributeOptions,
  types: TSESTree.TypeNode[],
): boolean => {
  if (options.alwaysBreak === false) {
    return false;
  }


  if (options.alwaysBreak === true) {
    return types.length >= DEFAULT_ALWAYS_BREAK_AT;
  }

  return types.length >= options.alwaysBreak;
};

export default shouldAlwaysBreak;
