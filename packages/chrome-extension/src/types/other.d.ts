declare namespace Other {
  interface MutableRefObject<T> {
    current: T | null;
  }

  namespace Immer {
    type PrimitiveType = number | string | boolean;

    type Immutable<T> = T extends PrimitiveType ? T : T extends AtomicObject ? T : T extends IfAvailable<ReadonlyMap<infer K, infer V>> ? ReadonlyMap<Immutable<K>, Immutable<V>> : T extends IfAvailable<ReadonlySet<infer V>> ? ReadonlySet<Immutable<V>> : T extends WeakReferences ? T : T extends App.UnknownObject ? {
      readonly [K in keyof T]: Immutable<T[K]>;
    } : T;

    type AtomicObject =
      | App.UnknownFunction
      | Promise<App.Any>
      | Date
      | RegExp
      | boolean
      | number
      | string;

    type IfAvailable<T, Fallback = void> =
      | true
      | false extends (T extends never ? true : false)
      ? Fallback
      : keyof T extends never
      ? Fallback
      : T;

    type WeakReferences =
      | IfAvailable<WeakMap<App.Any, App.Any>>
      | IfAvailable<WeakSet<App.App>>;

    type WritableDraft<T> = {
      -readonly [K in keyof T]: Draft<T[K]>;
    };

    type Draft<T> = T extends AtomicObject
      ? T
      : T extends IfAvailable<ReadonlyMap<infer K, infer V>>
      ? Map<Draft<K>, Draft<V>>
      : T extends IfAvailable<ReadonlySet<infer V>>
      ? Set<Draft<V>> : T extends WeakReferences
      ? T
      : T extends App.UnknownObject
      ? WritableDraft<T>
      : T;
  }
}