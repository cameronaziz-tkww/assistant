import shouldAlwaysBreak from '../../../util/typeDeclarationLength/shouldAlwaysBreak';
import * as Types from '../../../util/typeDeclarationLength/types';
import * as mocks from '../../__mocks__/typeDeclarationLength';

describe('shouldAlwaysBreak', () => {

  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  it('should return false when not false option', () => {
    const options: Types.AttributeOptions = {
      ...mocks.baseAttributeOptions,
      alwaysBreak: false,
    };
    const result = shouldAlwaysBreak(options, mocks.types);
    expect(result).toBe(false);
  });

  it('should return true when true option', () => {
    const options: Types.AttributeOptions = {
      ...mocks.baseAttributeOptions,
      alwaysBreak: true,
    };
    const result = shouldAlwaysBreak(options, mocks.types);
    expect(result).toBe(true);
  });

  it('should return true when integer option', () => {
    const options: Types.AttributeOptions = {
      ...mocks.baseAttributeOptions,
      alwaysBreak: 2,
    };
    const result = shouldAlwaysBreak(options, mocks.types);
    expect(result).toBe(true);
  });
});

