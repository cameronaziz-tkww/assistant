declare namespace Runtime {
  namespace Jira {
    type Loading =
      | 'jira-auth'
      | 'jira-issues'
      | 'jira-fetch'
      | 'jira-meta'
      | 'jira-projects';

    interface IssuesFetch {
      type: 'jira/ISSUES_FETCH';
      meta: SendMeta
    }

    interface StatusesFetch {
      type: 'jira/STATUSES_FETCH';
      projectKey: string | number;
      meta: SendMeta
    }

    interface BoardsFetch {
      type: 'jira/BOARDS_FETCH';
    }

    interface ProjectsFetch {
      type: 'jira/PROJECTS_FETCH';
      meta: SendMeta
    }

    interface SprintsFetch {
      type: 'jira/SPRINTS_FETCH';
      boardId: number;
    }

    interface Logout {
      type: 'jira/LOGOUT';
    }

    interface AuthenticateCheck {
      type: 'jira/AUTHENTICATE_CHECK';
    }

    interface AuthenticateRequest {
      type: 'jira/AUTHENTICATE_REQUEST';
      token?: string;
      meta: SendMeta;
    }

    interface IsAuthenticated {
      type: 'jira/IS_AUTHENTICATED';
      isAuthenticated: boolean;
    }

    interface IssuesResponse {
      type: 'jira/ISSUES_RESPONSE';
      data: App.Jira.Issue[];
      meta: ResponseMeta;
    }

    interface ProjectsResponseData {
      projects: App.Jira.Project[];
      watched: App.Jira.Watched;
    }

    interface ProjectsResponse {
      type: 'jira/PROJECTS_RESPONSE';
      data: ProjectsResponseData;
      meta: ResponseMeta;
    }

    interface SprintsResponse {
      type: 'jira/SPRINTS_RESPONSE';
      sprints: SimpleSprint[];
      boardId: number;
      meta: ResponseMeta;
    }

    interface Refresh {
      type: 'jira/REFRESH'
    }

    interface ProjectsUpdateWatched {
      type: 'jira/PROJECTS_UPDATE_WATCHED';
      projectId: string;
      id: string;
      idIsStatus: boolean;
      nextInclude: boolean;
      meta: SendMeta;
    }

    type Fetcher = IssuesFetch | BoardsFetch | SprintsFetch | ProjectsFetch | StatusesFetch | AuthenticateRequest | AuthenticateCheck | Logout;
    type Responses = IssuesResponse | SprintsResponse | ProjectsResponse | IsAuthenticated;
    type Setter = ProjectsUpdateWatched;

    type Message =
      | Fetcher
      | Setter
      | Responses;
  }
}
