import camelToSnake from '../../../util/hidash/camelToSnake';

describe('camelToSnake', () => {
  it('should handle undefined', () => {
    const result = camelToSnake();
    expect(result)
      .toBe(undefined);
  });

  it('should handle non strings', () => {
    const value = 1;
    const result = camelToSnake(value);
    expect(result)
      .toBe('1');
  });

  it('should handle already snake', () => {
    const value = 'SOURCE_VALUE';
    const result = camelToSnake(value);
    expect(result)
      .toBe(value);
  });

  it('should handle already camelCase', () => {
    const value = 'camelCase';
    const result = camelToSnake(value);
    expect(result)
      .toBe('CAMEL_CASE');
  });

  it('should handle already camelCaseWithCAPS', () => {
    const value = 'camelCaseWithCAPS';
    const result = camelToSnake(value);
    expect(result)
      .toBe('CAMEL_CASE_WITH_CAPS');
  });

  it('should handle already camelCaseWithCAPSInTheMiddle', () => {
    const value = 'camelCaseWithCAPSInTheMiddle';
    const result = camelToSnake(value);
    expect(result)
      .toBe('CAMEL_CASE_WITH_CAPS_IN_THE_MIDDLE');
  });

  it('should handle already CAPSAtTheStart', () => {
    const value = 'CAPSAtTheStart';
    const result = camelToSnake(value);
    expect(result)
      .toBe('CAPS_AT_THE_START');
  });
});
