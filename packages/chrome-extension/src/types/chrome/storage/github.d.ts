declare namespace Storage {
  namespace Github {
    type All = Auth & Settings & OnlyArrays & {
      githubRepositories: GithubRepositories;
      /** @deprecated */
      githubOrganizations: Organizations;
    }

    type OnlyArrays = {
      githubPullRequests: PullRequests;
    }

    interface Auth {
      githubAuth: AuthStore;
    }

    interface Settings {
      githubSettings: SettingsStore;
    }

    interface Organizations {
      organizations: App.Github.Organization[]
    }

    interface GithubRepositories {
      repositories: Repositories[];
      watchedList: Watched[];
    }

    interface Watched {
      name: string;
      owner: string;
      id: string;
    }

    type Repositories = Omit<App.Github.Repository, 'isWatched'>

    interface SettingsStore {
      reviewsRequired?: number;
      filters: App.Github.FilterableKeys[]
    }

    interface OAuth {
      accessToken: string;
      expiresIn: string;
      refreshToken: string;
      refreshTokenExpiresIn: string;
      tokenType: string;
      scope: string;
    }

    interface AuthStore {
      name?: string;
      OAuth?: OAuth;
      personalAccessToken?: string;
    }

    // interface Repositories {
    //   repositories: App.Github.Repositories
    // }

    interface PullRequests {
      pullRequests: App.Github.PullRequest[]
    }
  }
}
