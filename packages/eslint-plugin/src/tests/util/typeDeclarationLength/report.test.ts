import * as createFix from '../../../util/typeDeclarationLength/createFix';
import * as mocks from '../../__mocks__/typeDeclarationLength';
import report from '../../../util/typeDeclarationLength/report';

jest.mock(
  '../../../util/typeDeclarationLength/createFix',
  () => jest.fn(),
);

const createFixSpy = jest.spyOn(createFix, 'default');

describe('report', () => {

  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  it('should work', () => {
    const fix = jest.fn();
    createFixSpy.mockImplementationOnce(() => fix);

    report(mocks.fixConfig);

    expect(mocks.getSourceCode)
      .toBeCalledTimes(1);
    expect(createFixSpy)
      .toBeCalledWith(
        mocks.sourceCode,
        mocks.fixConfig,
      );
    expect(mocks.context.report)
      .toBeCalledWith({
        node: mocks.fixConfig.node,
        data: mocks.fixConfig.data,
        messageId: mocks.fixConfig.messageId,
        fix,
      });
  });
});
