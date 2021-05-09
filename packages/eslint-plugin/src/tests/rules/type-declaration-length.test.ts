import { TSESLint } from '@typescript-eslint/experimental-utils';
import typeDeclarationLength, { schema } from '../../rules/type-declaration-length';
import * as Types from '../../util/typeDeclarationLength/types';

describe('type-declaration-length', () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  });

  const smallMax: Types.ContextOptions = {
    maxLength: 30,
  };

  const largeMax: Types.ContextOptions = {
    maxLength: 200,
  };

  describe('TSUnionType', () => {
    tester.run<Types.MessageIds, typeof schema>(
      'tkww-assistant/type-declaration-length',
      typeDeclarationLength,
      {
        valid: [
          {
            code: 'type MyType = \'foo\' | \'bar\';',
          },
        ],
        invalid: [
          {
            /* eslint-disable max-len */
            code: `\
type MyType = 'bar' | 'baz' | number | boolean | MyType | MyOtherTypeWithALongName | 'harder' | 'to' | 'read';`,
            /* eslint-enable max-len */
            errors: [
              {
                messageId: 'tooLong',
              },
            ],
            output: `\
type MyType =
  |'bar'
  | 'baz'
  | number
  | boolean
  | MyType
  | MyOtherTypeWithALongName
  | 'harder'
  | 'to'
  | 'read';`,
          },
        ],
      },
    );
  });

  describe('TSUnionType with options', () => {
    tester.run<Types.MessageIds, typeof schema>(
      'tkww-assistant/type-declaration-length',
      typeDeclarationLength,
      {
        valid: [
          {
            code: 'type MyType = \'foo\' | \'bar\';',
            options: [smallMax],
          },
          {
            /* eslint-disable max-len */
            code: `\
type MyType = 'bar' | 'baz' | number | boolean | MyType | MyOtherTypeWithALongName | 'harder' | 'to' | 'read';`,
            /* eslint-enable max-len */
            options: [largeMax],

          },
        ],
        invalid: [
          {
            /* eslint-disable max-len */
            code: `\
type MyType = 'bar' | 'baz' | number | boolean;`,
            /* eslint-enable max-len */
            options: [smallMax],
            errors: [
              {
                messageId: 'tooLong',
              },
            ],
            output: `\
type MyType =
  |'bar'
  | 'baz'
  | number
  | boolean;`,
          },
        ],
      },
    );
  });

  describe('TSIntersectionType', () => {
    tester.run<Types.MessageIds, typeof schema>(
      'tkww-assistant/type-declaration-length',
      typeDeclarationLength,
      {
        valid: [
          {
            code: 'type MyType = \'foo\' & \'bar\';',
          },
        ],
        invalid: [
          {
            /* eslint-disable max-len */
            code: `\
type MyType = 'bar' & 'baz' & number & boolean & MyType & MyOtherTypeWithALongName & 'harder' & 'to' & 'read';`,
            /* eslint-enable max-len */
            errors: [
              {
                messageId: 'tooLong',
              },
            ],
            output: `\
type MyType =
  &'bar'
  & 'baz'
  & number
  & boolean
  & MyType
  & MyOtherTypeWithALongName
  & 'harder'
  & 'to'
  & 'read';`,
          },
        ],
      },
    );
  });

  describe('TSTupleType', () => {
    tester.run<Types.MessageIds, typeof schema>(
      'tkww-assistant/type-declaration-length',
      typeDeclarationLength,
      {
        valid: [
          {
            code: 'type MyType = [\'foo\', \'bar\'];',
          },
        ],
        invalid: [
          {
            /* eslint-disable max-len */
            code: `\
type MyType = ['bar', 'baz', number, boolean, MyType, MyOtherTypeWithALongName, 'harder', 'to', 'read'];`,
            /* eslint-enable max-len */
            errors: [
              {
                messageId: 'tooLong',
              },
            ],
            output: `\
type MyType = [
  'bar',
  'baz',
  number,
  boolean,
  MyType,
  MyOtherTypeWithALongName,
  'harder',
  'to',
  'read',
];`,
          },
        ],
      },
    );
  });
});
