import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as Types from '../../types';

// export type Action = 'before' | 'after' | 'unchanged';

export interface RuleConfig {
  reactAlwaysFirst: boolean;
  styleAlwaysLast: boolean;
  ignoreLeadingAt: boolean;
  ignoreCases: boolean;
}

export type RuleOptions = [RuleConfig];

export type ParseValue = [specifierValue: string, ruleOptions: RuleConfig];

export interface Move {
  specifier: Specifier;
  nextAtDestination: Specifier | null;
  beforeAtDestination: Specifier | null;
  nextBeforeFix: Specifier;
  positionBeforeMove: number;
}

export interface Specifier {
  text: string;
  importNode: TSESTree.ImportDeclaration,
  value: Types.Value,
  currentPlace: number,
  expectedPlace: number,
}
