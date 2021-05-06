declare namespace Hooks {
  namespace Jira {
    interface UseIssuesDispatch {
      issues: App.Jira.Issue[];
    }

    interface UseIssues {
      (): UseIssuesDispatch;
    }

    interface Projects {
      all: App.Jira.Project[];
      watches: App.Jira.Watched;
      watchedProjects: App.Jira.Project[];
    }

    interface UpdateWatched {
      projectId: string;
      id: string;
      idIsStatus: boolean;
      nextInclude: boolean;
    }

    interface UseProjectssDispatch {
      projects: Projects;
      updateWatched(watched: UpdateWatched): void,
    }

    interface UseProjects {
      (): UseProjectssDispatch;
    }

    interface UseAccessProjects {
      (): App.ShouldDefineType;
    }

    interface UseUpdateSettingsDispatch<T extends keyof Storage.Jira.SettingsStore> {
      (key: T, updates: Storage.Jira.SettingsStore[T]): void
    }

    interface UseUpdateSettings<T extends keyof Storage.Jira.SettingsStore> {
      (): UseUpdateSettingsDispatch<T>
    }
  }
}
