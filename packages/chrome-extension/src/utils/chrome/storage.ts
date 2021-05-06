declare const chrome: Chrome.Instance;

const get = <T extends keyof Storage.All>(key: T): Promise<Storage.Store<T> | null> => new Promise<Storage.Store<T> | null>((resolve) => {
  chrome.storage.local.get(
    key,
    (data) => {
      if (Object.keys(data).length === 0) {
        resolve(null);
      }
      resolve(data[key]);
    },
  );
});

const getData = async <T extends keyof Storage.All>(key: T): Promise<Storage.All[T] | null> => {
  const response = await get(key);
  if (response) {
    return response.data;
  }
  return null;
};

const set = <T extends keyof Storage.All>(
  key: T,
  data: Storage.All[T],
): Promise<Storage.Store<T> | null> => new Promise<Storage.Store<T>>((resolve) => {
  const storeData: Storage.Store<T> = {
    data,
    lastUpdate: Date.now(),
  };
  const store = {
    [key]: storeData,
  };
  chrome.storage.local.set(
    store,
    () => {
      resolve(storeData);
    });
});

const remove = <T extends keyof Storage.All>(key: T | T[]): void => {
  chrome.storage.local.remove(key);
};

const addListener = <T extends keyof Storage.All>(key: T, listener: Storage.ChangeListener<T>): () => void => {

  const localListener = (changes: Chrome.Storage.Changes, namespace: Chrome.Storage.Namespace) => {
    const value = changes[key] as Chrome.Storage.Change<T>;
    if (value) {
      const { newValue, oldValue } = value;
      const change: Storage.Change<T> = {
        oldValue: oldValue?.data,
        newValue: newValue?.data,
      };
      listener(change, namespace);
    }
  };

  if (!chrome.storage.onChanged.hasListener(localListener)) {
    chrome.storage.onChanged.addListener(localListener);
  }

  const stopListening = () => {
    hangup(localListener);
  };

  return stopListening;
};

const hangup = (listener: Chrome.Storage.ChangeListener) => {
  if (chrome.storage.onChanged.hasListener(listener)) {
    chrome.storage.onChanged.removeListener(listener);
  }
};

interface Predicate {
  <T extends keyof Storage.All>(item: Runtime.StorageListenMessage<T>): boolean
}

const inferStorage = <T extends keyof Storage.All>(unknown: Runtime.StorageListenMessage<keyof Storage.All>, predicate: Predicate): unknown is Runtime.StorageListenMessage<T> => predicate(unknown);

const predicate = {
  githubSettings: <T extends keyof Storage.All>(message: Runtime.StorageListenMessage<T>): boolean => message.key === 'githubSettings',
  filters: <T extends keyof Storage.All>(message: Runtime.StorageListenMessage<T>): boolean => message.key === 'filters',
  linksStandard: <T extends keyof Storage.All>(message: Runtime.StorageListenMessage<T>): boolean => message.key === 'linksStandard',
  linksCustom: <T extends keyof Storage.All>(message: Runtime.StorageListenMessage<T>): boolean => message.key === 'linksCustom',
  linksOrder: <T extends keyof Storage.All>(message: Runtime.StorageListenMessage<T>): boolean => message.key === 'linksOrder',
};

const guards = {
  honeybadgerSettings: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'honeybadgerSettings'> => message.key === 'honeybadgerSettings',
  jiraSettings: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'jiraSettings'> => message.key === 'jiraSettings',
  githubSettings: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'githubSettings'> => message.key === 'githubSettings',
  filters: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'filters'> => message.key === 'filters',
  linksStandard: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'linksStandard'> => message.key === 'linksStandard',
  linksCustom: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'linksCustom'> => message.key === 'linksCustom',
  linksOrder: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'linksOrder'> => message.key === 'linksOrder',
  visibleUnits: (message: Runtime.StorageListenMessage<keyof Storage.All>): message is Runtime.StorageListenMessage<'visibleUnits'> => message.key === 'visibleUnits',
  isAuthenticatedMessage: (message: Runtime.Message, unit: App.Unit): message is Runtime.IsAuthenticated => {
    if (message.type === 'github/IS_AUTHENTICATED' && unit === 'github') {
      return true;
    }

    if (message.type === 'jira/IS_AUTHENTICATED' && unit === 'jira') {
      return true;
    }

    return false;
  },
};

export default {
  ...chrome.storage,
  guards,
  addListener,
  inferStorage,
  get,
  getData,
  predicate,
  remove,
  set,
};
