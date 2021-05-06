declare namespace Runtime {
  namespace Honeybadger {
    interface AuthenticateRequest {
      type: 'honeybadger/AUTHENTICATE_REQUEST';
      token: string;
      meta: SendMeta;
    }

    interface IsAuthenticated {
      type: 'honeybadger/IS_AUTHENTICATED';
      isAuthenticated: boolean;
    }

    interface Logout {
      type: 'honeybadger/LOGOUT';
    }

    interface RecentNewNoticesFetch {
      type: 'honeybadger/RECENT_NEW_NOTICES_FETCH';
      meta: SendMeta;
    }

    interface RecentNewNoticesResponse {
      type: 'honeybadger/RECENT_NEW_NOTICES_RESPONSE';
      data: unknown
      meta: ResponseMeta
    }

    interface ProjectsFetch {
      type: 'honeybadger/PROJECTS_FETCH';
      meta: SendMeta;
    }

    interface ProjectsResponse {
      type: 'honeybadger/PROJECTS_RESPONSE';
      data: App.Honeybadger.Project[];
      meta: ResponseMeta
    }

    interface ProjectsSet {
      type: 'honeybadger/PROJECTS_SET';
      data: App.Honeybadger.Project[]
      meta: SendMeta;
    }

    type Fetcher = RecentNewNoticesFetch | AuthenticateRequest | ProjectsFetch | Logout
    type Setter = ProjectsSet
    type Responses = RecentNewNoticesResponse | ProjectsResponse | IsAuthenticated

    type Message =
      | Fetcher
      | Setter
      | Responses;
  }
}
