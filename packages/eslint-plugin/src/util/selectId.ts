import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as typeguards from '../typeguards';
import { NodeId } from '../types';

export const selectId = <T extends TSESTree.BaseNode>(node: T): T | Exclude<NodeId, null> => {
  if (
    typeguards.hasId(node)
    && typeguards.isTruthy(node.id)
  ) {
    return node.id;
  }
  return node;
};

export default selectId;
