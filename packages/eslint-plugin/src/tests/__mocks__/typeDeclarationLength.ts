import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { baseDefaultOptions, defaultOptions } from '../../rules/type-declaration-length';
import type { PropertyNamesOnly } from '../../types';
import type * as Types from '../../util/typeDeclarationLength/types';

export const sourceCode = {
  getTokenBefore: jest.fn(),
  getTokenAfter: jest.fn(),
} as unknown as TSESLint.SourceCode;

type Fix = keyof TSESLint.RuleFixer;

interface BaseFix {
  fix: Fix;
}

interface Insert extends BaseFix {
  nodeOrToken: TSESTree.Node | TSESTree.Token,
  text: string
}

interface RemoveRange extends BaseFix {
  range: TSESTree.Range;
}

interface ReplaceTextRange extends RemoveRange {
  text: string
}

export const fixer = {
  insertTextAfter: jest.fn((
    nodeOrToken: TSESTree.Node | TSESTree.Token,
    text: string
  ): Insert => ({
    fix: 'insertTextAfter',
    nodeOrToken,
    text,
  })),
  insertTextBefore: jest.fn((
    nodeOrToken: TSESTree.Node | TSESTree.Token,
    text: string
  ): Insert => ({
    fix: 'insertTextBefore',
    nodeOrToken: nodeOrToken,
    text,
  })),
  removeRange: jest.fn((
    range: TSESTree.Range,
  ): RemoveRange => ({
    fix: 'removeRange',
    range,
  })),
  replaceTextRange: jest.fn((
    range: TSESTree.Range,
    text: string
  ): ReplaceTextRange => ({
    fix: 'replaceTextRange',
    range,
    text,
  })),
} as unknown as TSESLint.RuleFixer;

export const loc = {
  start: {
    line: 10,
    column: 0,
  },
  end: {
    line: 20,
    column: 10,
  },
};

export const dynamicLoc = (index: number) => ({
  start: {
    line: 1,
    column: index * 10 + 1,
  },
  end: {
    line: 1,
    column: (index * 10) + 10,
  },
});

export const beforeToken = (index: number) => ({
  range: [index * 10, (index * 10) + 1],
  loc,
}) as TSESTree.Token;

export const middleNode = (index: number) => ({
  range: [(index * 10) + 1, (index * 10) + 10],
  loc: dynamicLoc(index),
}) as TSESTree.TSIntersectionType;

export const afterToken = (index: number) => ({
  range: [(index * 10) + 10, (index * 10) + 11],
  loc,
}) as TSESTree.Token;

export const handleConfig = {
  afterToken: afterToken(1),
  beforeToken: beforeToken(1),
  fixer,
  fixes: [] as TSESLint.RuleFix[],
  leadingIndent: '  ',
  type: middleNode(1),
  delimiter: '|',
  indentDepth: 2,
  isFirst: false,
  startLine: 0,
};

export const nodes = Array
  .from({ length: 5 })
  .map((_value, index) => ({
    beforeToken: beforeToken(index),
    middleNode: middleNode(index),
    afterToken: afterToken(index),
  }));

export const locSame = (index: number) => ({
  start: {
    line: 10,
    column: index * 10,
  },
  end: {
    line: 10,
    column: (index * 10) + 2,
  },
});

export const types = [
  { loc: locSame(0) }, { loc: locSame(1) }, { loc: locSame(2) },
] as TSESTree.TypeNode[];

// const intersectionNode = {
//   loc,
//   types,
// } as TSESTree.TSIntersectionType;

export const tupleNode = {
  loc,
  elementTypes: types,
} as TSESTree.TSTupleType;

const node = {
  loc,
  types,
} as TSESTree.TSIntersectionType;

const data: Types.BaseData = {
  declarationType: 'union',
};

const messageId = 'breakOneBreakAll' as const;

export const getSourceCode = jest.fn(() => sourceCode);

export const context = {
  getSourceCode,
  report: jest.fn(),
  id: 'A TEST ID',
} as unknown as jest.Mocked<Types.Context>;

export const runConfig: Types.RunConfig<
  TSESTree.TSIntersectionType,
  PropertyNamesOnly<TSESTree.TSIntersectionType>
> = {
  node,
  context,
  typeKey: 'types',
  options: defaultOptions,
  declarationType: 'union',
};

export const runTaskConfig: Types.RunTaskConfig<
  TSESTree.TSIntersectionType,
  PropertyNamesOnly<TSESTree.TSIntersectionType>
> = {
  ...runConfig,
  startingLine: 10,
  attributeOptions: {
    ...baseDefaultOptions,
    enabled: true,
  },
};

export const fixConfig: Types.FixConfig<
  TSESTree.TSIntersectionType,
  PropertyNamesOnly<TSESTree.TSIntersectionType>
> = {
  context,
  node,
  data,
  messageId,
  typeKey: 'types',
  options: defaultOptions,
};

export const baseAttributeOptions: Types.AttributeOptions = {
  ...baseDefaultOptions,
  enabled: true,
};
