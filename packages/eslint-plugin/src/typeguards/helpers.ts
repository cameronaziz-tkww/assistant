export const isDefined = <T extends Record<string, any>>(
  unknown?: T,
): unknown is T => typeof unknown !== 'undefined';

const falsy: any[] = [undefined, null, false, NaN];

// What I believe truth should be
export const isTruthy = <T extends any>(
  unknown?: T,
): unknown is Exclude<T, null | undefined | false> =>
    typeof unknown !== 'undefined'
      && !falsy.includes(unknown);
