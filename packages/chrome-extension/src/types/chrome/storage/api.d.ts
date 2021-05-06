declare namespace Chrome {
  namespace Storage {
    interface Local {
      QUOTA_BYTES: number
      clear(cb: App.Callback): void;
      get(keys: string | string[] | App.UnknownObject | undefined, callback: App.Callback<App.ShouldDefineType>): void;
      getBytesInUse(keys: string | string[] | undefined, callback: App.Callback): void;
      onChanged: OnChanged;
      remove(keys: string | string[], callback?: App.Callback): void;
      set(data: App.UnknownObject, callback?: App.Callback): void;
    }

    interface Change<T extends keyof All = keyof All> {
      oldValue?: Store<T>;
      newValue?: Store<T>;
    }

    interface Sync {
      MAX_ITEMS: 512
      MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 1000000
      MAX_WRITE_OPERATIONS_PER_HOUR: 1800
      MAX_WRITE_OPERATIONS_PER_MINUTE: 120
      QUOTA_BYTES: 102400
      QUOTA_BYTES_PER_ITEM: 8192
      clear(cb: App.Callback): void;
      get(keys: string | string[] | App.UnknownObject | undefined, callback: App.Callback<App.ShouldDefineType>): void;
      getBytesInUse(keys: string | string[] | undefined, callback: App.Callback): void;
      onChanged: OnChanged;
      remove(keys: string | string[], callback?: App.Callback): void;
      set(data: Record<string, App.ShouldDefineType>, callback?: App.Callback): void;
    }

    type Namespace = 'local' | 'sync';

    type Changes = {
      [Key in keyof All]?: Change<Key>
    }

    interface ChangeListener {
      (changes: Changes, namespace: Namespace): void;
    }

    interface OnChanged {
      addListener(listener: ChangeListener): void
      dispatch: App.ShouldDefineType
      hasListener(listener: ChangeListener): boolean;
      hasListeners(listeners: ChangeListener[]): boolean;
      removeListener(listener: ChangeListener): void;
    }

    interface API {
      local: Local;
      managed: App.ShouldDefineType;
      onChanged: OnChanged;
      sync: Sync;
    }
  }
}
