export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] // check if property is array, infer that each element is type U
    ? RecursivePartial<U>[] // run RecursivePartial on each element, passing type U
    : T[P] extends object // check if property is an object
    ? RecursivePartial<T[P]> // run RecursivePartial on each property
    : T[P]; // or its a primitive and just set it, like Partial<T>
};
