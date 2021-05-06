declare namespace Runtime {
  namespace Github {
    type Loading =
      | 'github-auth'
      | 'github-repositories'
      | 'github-organizations'
      | 'github-pull-requests'
      | 'github-fetch'
      | 'github-refresh';

    interface PullRequestsFetch {
      type: 'github/PULL_REQUESTS_FETCH';
      isInternal?: boolean;
      meta: SendMeta;
    }

    interface RepositoriesFetch {
      type: 'github/REPOSITORIES_FETCH';
      organizationName?: string;
      meta: SendMeta;
    }

    interface RepositoriesUpdateWatched {
      type: 'github/REPOSITORIES_UPDATE_WATCHED';
      id: string;
      nextIsWatched: boolean;
    }

    interface PullRequestsResponse {
      type: 'github/PULL_REQUESTS_RESPONSE';
      data: App.Github.PullRequest[];
      meta: ResponseMeta;
    }

    interface RepositoriesResponse {
      type: 'github/REPOSITORIES_RESPONSE';
      data: App.Github.Repository[];
      meta: ResponseMeta;
    }

    interface AuthenticateCheck {
      type: 'github/AUTHENTICATE_CHECK';
    }

    interface AuthenticateRequest {
      type: 'github/AUTHENTICATE_REQUEST';
      token?: string;
      meta: SendMeta;
    }

    interface IsAuthenticated {
      type: 'github/IS_AUTHENTICATED';
      isAuthenticated: boolean;
      login?: string;
    }

    interface Refresh {
      type: 'github/REFRESH';
    }

    interface Logout {
      type: 'github/LOGOUT';
    }

    interface SettingsChange<T extends keyof Storage.Github.All = keyof Storage.Github.All> {
      type: 'github/SETTINGS_CHANGE';
      property: T
      changes: Partial<Storage.Github.All[T]>
    }

    type Fetcher = PullRequestsFetch | RepositoriesFetch | AuthenticateRequest | AuthenticateCheck | Logout;
    type Setter = RepositoriesUpdateWatched;
    type Responses = RepositoriesResponse | PullRequestsResponse | IsAuthenticated

    type Message =
      | Fetcher
      | Setter
      | Responses;
  }
}
