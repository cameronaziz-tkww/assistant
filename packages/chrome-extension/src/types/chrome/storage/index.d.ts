declare namespace Storage {

  type All =
    & Github.All
    & Jira.All
    & Links.All
    & Global.All
    & Honeybadger.All
    & History.All;

  type OnlyArrays =
    & History.OnlyArrays
    & Github.OnlyArrays
    & Jira.OnlyArrays;

  type Auth =
    & Github.Auth
    & Jira.Auth
    & Honeybadger.Auth;

  type Settings =
    & Github.Settings
    & Jira.Settings
    & Honeybadger.Settings;

  interface Store<T extends keyof All> {
    lastUpdate: number;
    data: All[T];
  }

  type AllStoreBase = {
    [K in keyof All]?: Store<T[K]>
  }

  type AllStore = AllStoreBase & {
    installEpoch: number;
  }

  interface ChangeListener<T extends keyof All> {
    (changes: Change<T>, namespace: API.Namespace): void;
  }

  interface Change<T extends keyof All> {
    oldValue?: All[T];
    newValue?: All[T];
  }

  interface Application {
    installEpoch: number
  }
}
