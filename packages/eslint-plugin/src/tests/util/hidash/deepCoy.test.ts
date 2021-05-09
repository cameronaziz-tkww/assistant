import deepCopy from '../../../util/hidash/deepCopy';
import * as isObject from '../../../util/hidash/isObject';

const isObjectLikeSpy = jest.spyOn(isObject, 'isObjectLike');

describe('deepCopy', () => {
  it('should return source when not object', () => {
    isObjectLikeSpy.mockImplementationOnce(() => false);
    // Using an object to ensure reference is the same (no copy was actually made)
    const notAnObject = {};
    const result = deepCopy(notAnObject);
    expect(result)
      .toBe(notAnObject);
  });

  it('should return source when null', () => {
    isObjectLikeSpy.mockImplementationOnce(() => true);
    const result = deepCopy(null);
    expect(result)
      .toBe(null);
  });

  it('should return a copy of an object', () => {
    const anObject = {
      property: 'value',
      anotherProperty: 'another_value',
      nestedObject: {
        aNestedProperty: 'is_nested',
      },
    };
    const result = deepCopy(anObject);
    // Ensure not the same reference
    expect(result)
      .not.toBe(anObject);
    expect(result.nestedObject)
      .not.toBe(anObject.nestedObject);
    // Ensure is the same object
    expect(result)
      .toEqual(anObject);
    // Ensure is the same object
    expect(result.nestedObject)
      .toEqual(anObject.nestedObject);
  });

  it('should return a copy of an array', () => {
    const anArray = [
      'value',
      'another_value',
      {
        anObjectProperty: 'value',
      },
    ];
    const result = deepCopy(anArray);
    // Ensure not the same reference
    expect(result)
      .not.toBe(anArray);
    result.forEach((element, index) => {
      if (typeof element === 'object') {
        expect(element)
          .not.toBe(anArray[index]);
      }
    });
    // Ensure is the same array
    expect(result)
      .toEqual(anArray);
    result.forEach((element, index) => {
      expect(element)
        .toEqual(anArray[index]);
    });
  });
});
