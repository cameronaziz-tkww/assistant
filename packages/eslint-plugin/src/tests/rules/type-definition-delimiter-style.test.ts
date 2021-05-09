import { TSESLint } from '@typescript-eslint/experimental-utils';
import typeDefinitionDelimiterStyle, { RuleOptions } from '../../rules/type-definition-delimiter-style';
import { MessageIds } from '../../util/messages';
import { RecursivePartial } from '../../types';

describe('type-definition-delimiter-style', () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  });

  const interfaceMultiSemi = `\
interface MyInterface {
  property: boolean;
};
`;

  const interfaceMultiNoSemi = `\
interface MyInterface {
  property: boolean;
}
`;

  const typeMultiSemi = `\
type MyType = {
  property: boolean;
};
`;

  const typeMultiNoSemi = `\
type MyType = {
  property: boolean;
}
`;

  const interfaceSingleSemi = `interface MyInterface { property: boolean };`;
  const interfaceSingleNoSemi = `interface MyInterface { property: boolean }`;
  const typeSingleSemi = `type MyType = { property: boolean };`;
  const typeSingleNoSemi = `type MyType = { property: boolean }`;

  describe('TSInterfaceBody', () => {
    describe('multiline', () => {
      tester.run<MessageIds<'type-definition-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/type-definition-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: interfaceMultiNoSemi,
            },
            {
              code: interfaceMultiSemi,
              options: [{
                multiline: {
                  delimiter: 'semi',
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
              code: interfaceMultiSemi,
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceMultiNoSemi,
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
              ],
              output: interfaceMultiNoSemi,
            },
          ],
        },
      );
    });
    describe('singleline', () => {
      tester.run<MessageIds<'type-definition-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/type-definition-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: interfaceSingleNoSemi,
            },
            {
              code: interfaceSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'semi',
                },
              }],
            },
            {
              code: interfaceSingleSemi,
              options: [
                {
                  singleline: {
                    delimiter: 'none',
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
              code: interfaceSingleSemi,
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceSingleNoSemi,
            },
            {
              code: interfaceSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'none',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: interfaceSingleNoSemi,
            },
          ],
        },
      );
    });
  });
  describe('TSTypeLiteral', () => {
    describe('multiline', () => {
      tester.run<MessageIds<'type-definition-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/type-definition-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: typeMultiNoSemi,
            },
            {
              code: typeMultiSemi,
              options: [{
                multiline: {
                  delimiter: 'semi',
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
              code: typeMultiSemi,
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeMultiNoSemi,
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
              ],
              output: typeMultiNoSemi,
            },
          ],
        },
      );
    });
    describe('singleline', () => {
      tester.run<MessageIds<'type-definition-delimiter-style'>, RecursivePartial<RuleOptions>>(
        'tkww-assistant/type-definition-delimiter-style',
        typeDefinitionDelimiterStyle,
        {
          valid: [
            {
              code: typeSingleNoSemi,
            },
            {
              code: typeSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'semi',
                },
              }],
            },
            {
              code: typeSingleSemi,
              options: [
                {
                  singleline: {
                    delimiter: 'none',
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
              code: typeSingleSemi,
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeSingleNoSemi,
            },
            {
              code: typeSingleSemi,
              options: [{
                singleline: {
                  delimiter: 'none',
                },
              }],
              errors: [
                {
                  messageId: 'unexpected',
                },
              ],
              output: typeSingleNoSemi,
            },
          ],
        },
      );
    });
  });
});
