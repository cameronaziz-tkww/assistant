import * as isObject from '../../../util/hidash/isObject';

describe('isObject', () => {
  describe('isObjectLike', () => {
    it('should handle undefined', () => {
      const result = isObject.isObjectLike();
      expect(result)
        .toBe(false);
    });

    it('should handle null', () => {
      const result = isObject.isObjectLike(null);
      expect(result)
        .toBe(false);
    });

    it('should handle string', () => {
      const result = isObject.isObjectLike('string');
      expect(result)
        .toBe(false);
    });

    it('should handle object', () => {
      const result = isObject.isObjectLike({});
      expect(result)
        .toBe(true);
    });

    it('should handle array', () => {
      const result = isObject.isObjectLike([]);
      expect(result)
        .toBe(true);
    });
  });

  describe('isObject', () => {
    it('should handle undefined', () => {
      const result = isObject.isObject();
      expect(result)
        .toBe(false);
    });

    it('should handle null', () => {
      const result = isObject.isObject(null);
      expect(result)
        .toBe(false);
    });

    it('should handle string', () => {
      const result = isObject.isObject('string');
      expect(result)
        .toBe(false);
    });

    it('should handle string', () => {
      const result = isObject.isObject({});
      expect(result)
        .toBe(true);
    });

    it('should handle array', () => {
      const result = isObject.isObject([]);
      // Arrays are object like but not objects
      expect(result)
        .toBe(false);
    });
  });
});
