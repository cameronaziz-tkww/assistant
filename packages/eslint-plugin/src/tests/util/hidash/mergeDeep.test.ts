import mergeDeep from '../../../util/hidash/mergeDeep';

describe('mergeDeep', () => {
  it('should merge', () => {
    const target = {
      onlyOnTarget: 'target',
      property: 'one',
      bothObject: {
        sameProperty: 'target_value',
        targetProperty: 'target',
      },
      onlyTarget: {
        property: 'value',
      },
    };
    const source = {
      property: 'two',
      onlyOnSource: 'source',
      bothObject: {
        sameProperty: 'source_value',
        sourceProperty: 'source',
      },
      onlySource: {
        property: 'value',
      },
    };
    const result = mergeDeep(target, source);
    expect(result)
      .toEqual({
        onlyOnTarget: 'target',
        property: 'two',
        onlyOnSource: 'source',
        bothObject: {
          sameProperty: 'source_value',
          sourceProperty: 'source',
          targetProperty: 'target',
        },
        onlySource: {
          property: 'value',
        },
        onlyTarget: {
          property: 'value',
        },
      });
  });
});
