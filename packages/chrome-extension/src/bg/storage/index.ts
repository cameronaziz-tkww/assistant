import { chrome, deepmerge, epoch, Reactor, uuid } from '@utils';
import EventEmitter from 'eventemitter3';
import defaultStorage from './defaultStorage';

const { storage } = chrome;
const { runtime, storage: { local, sync } } = chrome;

const bus = new EventEmitter();

interface Callback<T extends keyof Storage.All> {
  (data: Storage.All[T]): void;
}

type Listeners = {
  [K in keyof Storage.All]?: Set<Callback<K>>
}

class Storage {
  private started: boolean;
  private reactor: Reactor<keyof Storage.All>;
  private store: Storage.AllStore;
  private listeners: Listeners;

  constructor() {
    this.started = false;
    this.listeners = {};
    this.fetch();
    this.store = {
      installEpoch: 0,
    };
    this.reactor = new Reactor();
    this.start();

  }

  private start = () => {
    storage.onChanged.addListener(this.localListener);
    this.postStart();
  }

  private postStart = () => {
    local.get(
      'installEpoch',
      (data) => {
        if (Object.keys(data).length > 0) {
          this.store.installEpoch = data;
          return;
        }
        const now = epoch.now();
        this.store.installEpoch = now;
        const store = {
          installEpoch: now,
        };
        local.set(store);
      },
    );
  };

  private localListener = (changes: Chrome.Storage.Changes) => {
    Object
      .keys(changes)
      .forEach((key) => {
        if (changes[key]) {
          const item = key as keyof Storage.All;
          const value = changes[item]?.newValue;
          this.store[key] = value;
          this.dispatchListeners(item, value);
        }
      });
  }

  private fetch = () => {
    local.get(
      undefined,
      (store: Storage.AllStore) => {
        const merge = this.prep(store, this.store);
        this.store = merge;
        this.started = true;
        bus.emit('unlocked');
      },
    );

    // sync.get(
    //   undefined,
    //   (store: Storage.AllStore) => {
    //     const merge = this.prep(store, this.store);
    //     this.store = merge;
    //     this.started = true;
    //     // bus.emit('unlocked');
    //   },
    // );
  };

  private prep = (data: Storage.AllStore, store: Storage.AllStore): Storage.AllStore => {
    for (const key in data) {
      const current = data[key] as Storage.Store<keyof Storage.All>;
      const dataMerge = Array.isArray(current.data) ? current.data : deepmerge(undefined, defaultStorage[key], current.data);
      store[key] = {
        data: dataMerge,
        lastUpdate: current.lastUpdate,
      };
    }
    return store;
  }

  fetchProperty = async (message: Runtime.StorageGet): Promise<void> => {
    const { key, meta: { id } } = message;
    const data = await this.readProperty(key);
    if (data) {
      runtime.respond({
        type: 'STORAGE_ON',
        key, data,
        meta: {
          done: true,
          id,
        },
      });
      runtime.respond({
        type: 'STORAGE_ONCE',
        key, data,
        meta: {
          done: true,
          id,
        },
      });
    }
  };

  readProperty = async <T extends keyof Storage.All>(key: T): Promise<Storage.All[T] | null> => {
    if (!this.started) {
      await new Promise(resolve => bus.once('unlocked', resolve));
    }

    const local = this.store[key];
    if (local && local.data) {
      return local?.data || null;
    }

    const base = defaultStorage[key];
    if (base) {
      return base;
    }
    return null;
  };

  localRemove = <T extends keyof Storage.All>(key: T): Promise<void> => new Promise((resolve, reject) => {
    local.remove(
      key,
      () => {
        if (runtime.lastError) {
          reject(runtime.lastError);
        }
        resolve();
      },
    );
  });

  syncRemove = <T extends keyof Storage.All>(key: T): Promise<void> => new Promise((resolve, reject) => {
    sync.remove(
      key, () => {
        if (runtime.lastError) {
          reject(runtime.lastError);
        }
        resolve();
      },
    );
    window.event;
  });

  removeProperty = async <T extends keyof Storage.All>(key: T): Promise<void> => {
    this.store[key] = undefined;
    await this.localRemove(key);
    // const syncPromise = this.syncRemove(key);
    this.dispatchListeners(key);
  }

  listen = <T extends keyof Storage.All>(eventName: T, callback: Callback<T>): void => {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set() as Listeners[T];
    }
    const listeners = this.listeners[eventName];
    listeners?.add(callback as App.ShouldDefineType);
  }

  private dispatchListeners = <T extends keyof Storage.All>(key: T, value?: Storage.All[T]) => {
    const listeners = this.listeners[key];
    if (listeners) {
      listeners.forEach((listener) => {
        listener(value);
      });
    }
  }

  writeProperty = <T extends keyof Storage.All>(key: T, data: Utilities.RecursivePartial<Storage.All[T]>): Promise<Storage.All[T]> =>
    this.setProperty({
      key,
      data,
      meta: {
        id: uuid(),
      },
    });

  // isOnlyArray = <T extends keyof Storage.OnlyArrays, U extends keyof Storage.OnlyArrays[T]>(unknown: Storage.All[keyof Storage.All], property: U): unknown is Storage.OnlyArrays[keyof Storage.OnlyArrays] =>
  //   !!unknown && Array.isArray((unknown as Storage.OnlyArrays[keyof Storage.OnlyArrays])[property])
  isOnlyArray = <T extends keyof Storage.OnlyArrays, U extends keyof Storage.OnlyArrays[T]>(unknown: App.ShouldDefineType): unknown is Storage.OnlyArrays[T][U] =>
    Array.isArray(unknown)

  pushProperty = async <T extends keyof Storage.OnlyArrays, U extends keyof Storage.OnlyArrays[T]>(key: T, property: U, value: Utilities.ArrayElement<Storage.OnlyArrays[T][U]>): Promise<void> => {
    const attribute = await this.readProperty(key) as Storage.OnlyArrays[T];
    if (attribute) {
      const current = attribute[property];
      if (Array.isArray(current)) {
        current.push(value);
        this.setProperty({
          key,
          data: { [property]: current } as unknown as Utilities.RecursivePartial<Storage.All[T]>,
          meta: {
            id: uuid(),
          },
        });
      }
    }
  }

  setProperty = <T extends keyof Storage.All>(message: Omit<Runtime.StorageSet<T>, 'type'>): Promise<Storage.All[T]> =>
    new Promise<Storage.All[T]>(async (resolve) => {
      const { key, meta: { id } } = message;
      const data = JSON.parse(JSON.stringify(message.data));

      const dataStore = {
        data,
        lastUpdate: Date.now(),
      } as Storage.Store<T>;

      this.store = {
        ...this.store,
        [key]: dataStore,
      };

      const store = {
        [key]: dataStore,
        lastUpdate: Date.now(),
      };

      local.set(
        store,
        () => {
          resolve(dataStore.data as Storage.All[T]);
        },
      );

      this.dispatchListeners(key, data as Storage.All[T]);
      runtime.respond({
        type: 'STORAGE_ON',
        key,
        meta: {
          id,
          done: true,
        },
        data: dataStore.data,
      });
    });
}

export default Storage;
