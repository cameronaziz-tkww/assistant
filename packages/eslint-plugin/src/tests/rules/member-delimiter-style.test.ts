import { TSESLint } from '@typescript-eslint/experimental-utils';
import typeDefinitionDelimiterStyle, { RuleOptions } from '../../rules/member-delimiter-style';
import { RecursivePartial } from '../../types';
import { MessageIds } from '../../util/messages';

describe('member-delimiter-style', () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  });

  const interfaceMultiSemi = `\
interface MyInterface {
  property: boolean;
  other: string;
}
`;

  const interfaceMultiComma = `\
interface MyInterface {
  property: boolean,
  other: string,
}
`;

  const interfaceMultiNone = `\
interface MyInterface {
  property: boolean
  other: string
}
`;

  const interfaceMultiNoLast = `\
interface MyInterface {
  property: boolean;
  other: string
}
`;

  const typeMultiSemi = `\
type MyType = {
  property: boolean;
  other: string;
}
`;

  const typeMultiComma = `\
type MyType = {
  property: boolean,
  other: string,
}
`;

  const typeMultiNone = `\
type MyType = {
  property: boolean
  other: string
}
`;

  const typeMultiNoLast = `\
type MyType = {
  property: boolean;
  other: string
}
`;

  const interfaceSingleNoLast = `interface MyInterface { other: string };`;
  const interfaceSingleSemi = `interface MyInterface { property: boolean; other: string; };`;
  const interfaceSingleComma = `interface MyInterface { property: boolean, other: string, };`;
  const typeSingleSemi = `type MyType = { property: boolean; other: string; };`;
  const typeSingleComma = `type MyType = { property: boolean, other: string, };`;
  const typeSingleNoLast = `type MyType = { property: boolean; other: string }`;

  describe('TSInterfaceBody', () => {
    describe('multiline', () => {
      tester.run<MessageIds<'member-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/member-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: interfaceMultiSemi,
            },
            {
              code: interfaceMultiComma,
              options: [{
                multiline: {
                  delimiter: 'comma',
                },
              }],
            },
            {
              code: interfaceMultiNone,
              options: [{
                multiline: {
                  delimiter: 'none',
                },
              }],
            },
            {
              code: interfaceMultiNoLast,
              options: [{
                multiline: {
                  requireLast: false,
                },
              }],
            },
            {
              code: interfaceMultiSemi,
              options: [
                {
                  multiline: {
                    delimiter: 'none',
                  },
                },
                {
                  interface: {
                    multiline: {
                      delimiter: 'semi',
                    },
                  },
                },
              ],
            },
          ],
          invalid: [
            {
              code: interfaceMultiNone,
              errors: [
                {
                  messageId: 'expected',
                },
                {
                  messageId: 'expected',
                },
              ],
              output: interfaceMultiSemi,
            },
            {
              code: interfaceMultiSemi,
              options: [{
                multiline: {
                  delimiter: 'none',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceMultiNone,
            },
          ],
        },
      );
    });
    describe('singleline', () => {
      tester.run<MessageIds<'member-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/member-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: interfaceSingleNoLast,
            },
            {
              code: interfaceSingleComma,
              options: [{
                singleline: {
                  delimiter: 'comma',
                },
              }],
            },
            {
              code: interfaceSingleSemi,
              options: [{
                singleline: {
                  requireLast: true,
                },
              }],
            },
            {
              code: interfaceSingleSemi,
              options: [
                {
                  singleline: {
                    delimiter: 'comma',
                  },
                },
                {
                  interface: {
                    singleline: {
                      delimiter: 'semi',
                    },
                  },
                },
              ],
            },
          ],
          invalid: [
            {
              code: interfaceSingleComma,
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceSingleSemi,
            },
            {
              code: interfaceSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'comma',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceSingleComma,
            },
          ],
        },
      );
    });
  });
  describe('TSTypeLiteral', () => {
    describe('multiline', () => {
      tester.run<MessageIds<'member-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/member-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: typeMultiSemi,
            },
            {
              code: typeMultiComma,
              options: [{
                multiline: {
                  delimiter: 'comma',
                },
              }],
            },
            {
              code: typeMultiNone,
              options: [{
                multiline: {
                  delimiter: 'none',
                },
              }],
            },
            {
              code: typeMultiNoLast,
              options: [{
                multiline: {
                  requireLast: false,
                },
              }],
            },
            {
              code: typeMultiSemi,
              options: [
                {
                  multiline: {
                    delimiter: 'none',
                  },
                },
                {
                  typeLiteral: {
                    multiline: {
                      delimiter: 'semi',
                    },
                  },
                },
              ],
            },
          ],
          invalid: [
            {
              code: typeMultiNone,
              errors: [
                {
                  messageId: 'expected',
                },
                {
                  messageId: 'expected',
                },
              ],
              output: typeMultiSemi,
            },
            {
              code: typeMultiSemi,
              options: [{
                multiline: {
                  delimiter: 'none',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeMultiNone,
            },
          ],
        },
      );
    });
    describe('singleline', () => {
      tester.run<MessageIds<'member-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/member-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: typeSingleNoLast,
            },
            {
              code: typeSingleComma,
              options: [{
                singleline: {
                  delimiter: 'comma',
                },
              }],
            },
            {
              code: typeSingleSemi,
              options: [{
                singleline: {
                  requireLast: true,
                },
              }],
            },
            {
              code: typeSingleSemi,
              options: [
                {
                  singleline: {
                    delimiter: 'comma',
                  },
                },
                {
                  typeLiteral: {
                    singleline: {
                      delimiter: 'semi',
                    },
                  },
                },
              ],
            },
          ],
          invalid: [
            {
              code: typeSingleComma,
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeSingleSemi,
            },
            {
              code: typeSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'comma',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeSingleComma,
            },
          ],
        },
      );
    });
  });
});
