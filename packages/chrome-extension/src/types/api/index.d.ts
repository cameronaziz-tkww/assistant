declare namespace API {
  interface Endpoint {
    method: Method;
    url: string;
  }

  interface Endpoints {
    accessToken: Methods.Github.AccessToken;
    jiraBoards: Methods.Jira.Boards;
    jiraSprints: Methods.Jira.Sprints;
    jiraCurrentUser: Methods.Jira.CurrentUser;
    jiraFetch: Methods.Jira.Fetch;
    reviews: Methods.Github.Reviews;
    verifyToken: Methods.Github.VerifyToken;
    jiraMeta: Methods.Jira.Meta;
  }

  type ConfigParameter<T extends keyof Endpoints> = Parameters<Endpoints[T]>[0]

  interface EndpointConfig {
    accessToken: Methods.Github.AccessTokenConfig;
    jiraCurrentUser: App.ShouldDefineType;
    jiraBoards: Methods.Jira.BoardsConfig;
    jiraFetch: Methods.Jira.FetchConfig;
    reviews: Methods.Github.ReviewsConfig;
    verifyToken: App.ShouldDefineType;
    jiraSprints: Methods.Jira.SprintsConfig;
    jiraMeta?: void;
  }

  type Method = 'GET' | 'POST';
  type Authorization = 'token' | 'Basic';
  type NeedsAuth = 'reviews' | 'accessToken' | 'verifyToken' | 'jiraFetch' | 'jiraCurrentUser';
}