import * as nodes from '../../typeguards/nodes';
import { AST_NODE_TYPES, AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/experimental-utils';
import { NodeWithType } from '../../types/NodeHelperTypes';

describe('nodes', () => {
  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isBlockComment', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_TOKEN_TYPES.Block,
      } as TSESTree.Token;
      const result = nodes.isBlockComment(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_TOKEN_TYPES.Line,
      } as TSESTree.Token;
      const result = nodes.isBlockComment(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isBlockComment(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isBlockComment(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isLineComment', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_TOKEN_TYPES.Line,
      } as TSESTree.Token;
      const result = nodes.isLineComment(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_TOKEN_TYPES.Block,
      } as TSESTree.Token;
      const result = nodes.isLineComment(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isLineComment(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isLineComment(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTupleType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSTupleType,
      } as NodeWithType;
      const result = nodes.isTupleType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTupleType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTupleType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTupleType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isIntersectionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSIntersectionType,
      } as NodeWithType;
      const result = nodes.isIntersectionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isIntersectionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isIntersectionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isIntersectionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTSUnionType', () => {
    it('should return true for type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnionType,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(true);
    });

    it('should return false for different type', () => {
      const node = {
        type: AST_NODE_TYPES.TSUnknownKeyword,
      } as NodeWithType;
      const result = nodes.isTSUnionType(node);
      expect(result)
        .toBe(false);
    });

    it('should return false for undefined', () => {
      const result = nodes.isTSUnionType(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false for null', () => {
      const result = nodes.isTSUnionType(null);
      expect(result)
        .toBe(false);
    });
  });
});
