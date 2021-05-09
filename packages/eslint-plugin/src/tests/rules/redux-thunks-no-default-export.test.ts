import { TSESLint } from '@typescript-eslint/experimental-utils';
import reduxThunksNoDefaultExport, { RuleOptions } from '../../rules/redux-thunks-no-default-export';
import { RecursivePartial } from '../../types';
import { MessageIds } from '../../util/messages';
import determineShouldRun from '../__spies__/determineShouldRun';

const { determineShouldRunSpy, matched, notMatched } = determineShouldRun;

jest.mock('../../util/determineShouldRun', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('redux-thunks-no-default-export', () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  });

  const noDefault = `\
export const thunk = () => {};
`;

  const withDefault = `\
const thunk = () => {};

export default thunk;
`;

  describe('should run', () => {
    determineShouldRunSpy
      .mockImplementationOnce(() => matched)
      .mockImplementationOnce(() => matched);
    tester.run<MessageIds<'redux-thunks-no-default-export'>, RecursivePartial<RuleOptions>>(
      'tkww-assistant/redux-thunks-no-default-export',
      reduxThunksNoDefaultExport,
      {
        valid: [
          {
            code: noDefault,
          },
        ],
        invalid: [
          {
            code: withDefault,
            errors: [
              {
                messageId: 'noDefaultExport',
              },
            ],
          },
        ],
      },
    );
  });

  describe('should not run', () => {
    determineShouldRunSpy
      .mockImplementationOnce(() => notMatched);
    tester.run<MessageIds<'redux-thunks-no-default-export'>, RecursivePartial<RuleOptions>>(
      'tkww-assistant/redux-thunks-no-default-export',
      reduxThunksNoDefaultExport,
      {
        valid: [
          {
            code: withDefault,
          },
        ],
        invalid: [],
      },
    );
  });
});
