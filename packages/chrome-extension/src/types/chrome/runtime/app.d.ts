declare namespace Runtime {
  type Loading = Github.Loading | Jira.Loading;

  type LoadingMessage = StartLoading | StopLoading;
  interface StartLoading {
    type: 'START_LOADING';
    loading: Loading;
  }

  interface StopLoading {
    type: 'STOP_LOADING';
    loading: Loading;
  }

  interface StorageGet {
    type: 'STORAGE_GET';
    key: keyof Storage.All;
    meta: SendMeta;
  }

  interface StorageOn<T = keyof Storage.All> {
    type: 'STORAGE_ON';
    key: T;
    data: Storage.All[T];
    meta: ResponseMeta;
  }

  type StorageListenMessage<T extends keyof Storage.All> = StorageOn<T> | StorageOnce<T>

  interface StorageOnce<T = keyof Storage.All> {
    type: 'STORAGE_ONCE';
    key: T;
    data: Storage.All[T];
    meta: ResponseMeta;
  }

  interface StorageSet<T = keyof Storage.All> {
    type: 'STORAGE_SET';
    key: T;
    data: Utilities.RecursivePartial<Storage.All[T]>;
    arrayMergeKey?: string | MergeKeys;
    overwrite?: boolean;
    meta: SendMeta;
  }
}
