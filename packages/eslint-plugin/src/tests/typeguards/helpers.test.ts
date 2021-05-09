import * as helpers from '../../typeguards/helpers';

describe('helpers', () => {
  describe('isDefined', () => {
    it('should return true if defined', () => {
      const anObject = {
        aValue: 'ABC',
      };
      const result = helpers.isDefined(anObject);
      expect(result)
        .toBe(true);
    });

    it('should return false if not defined', () => {
      const result = helpers.isDefined(undefined);
      expect(result)
        .toBe(false);
    });
  });

  describe('isTruthy', () => {
    it('should return false if undefined', () => {
      const result = helpers.isTruthy(undefined);
      expect(result)
        .toBe(false);
    });

    it('should return false if null', () => {
      const result = helpers.isTruthy(null);
      expect(result)
        .toBe(false);
    });

    it('should return false if false', () => {
      const result = helpers.isTruthy(false);
      expect(result)
        .toBe(false);
    });

    it('should return false if NaN', () => {
      const result = helpers.isTruthy(NaN);
      expect(result)
        .toBe(false);
    });

    it('should return false if false', () => {
      const result = helpers.isTruthy(false);
      expect(result)
        .toBe(false);
    });

    it('should return true if an empty object', () => {
      const result = helpers.isTruthy({});
      expect(result)
        .toBe(true);
    });

    it('should return true if zero', () => {
      const result = helpers.isTruthy(0);
      expect(result)
        .toBe(true);
    });

    it('should return true if empty string', () => {
      const result = helpers.isTruthy('');
      expect(result)
        .toBe(true);
    });

    it('should return true if empty array', () => {
      const result = helpers.isTruthy([]);
      expect(result)
        .toBe(true);
    });
  });
});
