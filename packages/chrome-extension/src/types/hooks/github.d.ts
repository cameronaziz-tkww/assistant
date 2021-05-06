declare namespace Hooks {
  namespace Github {
    interface UsePullRequestsDispatch {
      pullRequests: App.Github.PullRequest[];
      init: App.EmptyCallback;
    }

    interface UsePullRequests {
      (): UsePullRequestsDispatch
    }

    interface Repositories {
      all: App.Github.Repository[]
      watched: App.Github.Repository<true>[]
      unwatched: App.Github.Repository<false>[]
    }

    interface UseSettingsDispatch<T extends keyof Storage.Github.SettingsStore> {
      settings: Pick<Storage.Github.SettingsStore, T>;
      init: App.EmptyCallback;
    }

    interface UseSettings<T extends keyof Storage.Github.SettingsStore> {
      (keys: T): UseSettingsDispatch
    }

    interface UseRepositoriesDispatch {
      updateWatched(repository: App.Github.Repository): void;
      repositories: Repositories;
    }

    interface UseRepositories {
      (): UseRepositoriesDispatch;
    }

    interface UseRepositories {
      (): UseRepositoriesDispatch;
    }

    interface UseAccessRepositories {
      (): App.ShouldDefineType;
    }

    interface UseUpdateSettingsDispatch<T extends keyof Storage.Github.SettingsStore> {
      (key: T, updates: Storage.Github.SettingsStore[T]): void
    }

    interface UseUpdateSettings<T extends keyof Storage.Github.SettingsStore> {
      (): UseUpdateSettingsDispatch<T>
    }
  }
}
