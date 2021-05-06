/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace Utilities {
  type CapitalizeUnion<T, U = any> = {
    [K in T as `${Capitalize<string & K>}`]: U;
  }

  interface Callback<T extends any[], U extends any = void> {
    (args: T): U;
  }

  type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] // check if property is array, infer that each element is type U
    ? RecursivePartial<U>[] // run RecursivePartial on each element, passing type U
    : T[P] extends App.UnknownObject // check if property is an object
    ? RecursivePartial<T[P]> // run RecursivePartial on each property
    : T[P]; // or its a primitive and just set it, like Partial<T>
  };

  type ArrayElement<T> = T extends (infer U)[] ? U : T;

  type MaybeArray<MaybeArrayType extends readonly unknown> =
    MaybeArrayType extends any[] ? ArrayElement<MaybeArrayType> : MaybeArrayType;

  type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;
}