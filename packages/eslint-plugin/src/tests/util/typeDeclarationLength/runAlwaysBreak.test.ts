import runAlwaysBreak from '../../../util/typeDeclarationLength/runAlwaysBreak';
import * as shouldAlwaysBreak from '../../../util/typeDeclarationLength/shouldAlwaysBreak';
import * as report from '../../../util/typeDeclarationLength/report';
import * as mocks from '../../__mocks__/typeDeclarationLength';

jest.mock(
  '../../../util/typeDeclarationLength/shouldAlwaysBreak',
  () => jest.fn(),
);

jest.mock(
  '../../../util/typeDeclarationLength/report',
  () => jest.fn(),
);

const shouldAlwaysBreakSpy = jest.spyOn(shouldAlwaysBreak, 'default');
const reportSpy = jest.spyOn(report, 'default');

describe('runAlwaysBreak', () => {
  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  it('should not call report when should not always break', () => {
    shouldAlwaysBreakSpy.mockImplementationOnce(() => false);

    runAlwaysBreak(mocks.runTaskConfig);
    expect(reportSpy).toBeCalledTimes(0);
  });

  it('should not call report when should always break', () => {
    shouldAlwaysBreakSpy.mockImplementationOnce(() => true);

    const result = runAlwaysBreak(mocks.runTaskConfig);

    expect(result).toBe(true);
    expect(reportSpy).toBeCalledWith({
      ...mocks.runTaskConfig,
      data: {
        declarationType: mocks.runTaskConfig.declarationType,
      },
      messageId: 'shouldBreak',
    });
  });

  it('should not call report when should messy', () => {
    shouldAlwaysBreakSpy.mockImplementationOnce(() => true);

    const messyConfig = {
      ...mocks.runTaskConfig,
      startingLine: 9,
    };

    const result = runAlwaysBreak(messyConfig);

    expect(result).toBe(true);
    expect(reportSpy).toBeCalledWith({
      ...messyConfig,
      data: {
        declarationType: mocks.runTaskConfig.declarationType,
      },
      messageId: 'shouldBreak',
    });
  });
});
