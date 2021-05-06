declare namespace Storage {
  namespace Jira {
    type All = Auth & Settings & OnlyArrays & {
      /** @deprecated */
      jiraMeta: Meta;
      jiraProjects: Projects;
    }

    type OnlyArrays = {
      jiraIssues: Issues;
    }

    interface Auth {
      jiraAuth: AuthStore;
    }

    interface Settings {
      jiraSettings: SettingsStore;
    }

    interface Projects {
      projects: App.Jira.Project[];
      watched: App.Jira.Watched;
    }

    interface AuthStore {
      email?: string;
      personalAccessToken?: string;
      OAuth?: OAuth;
      cloudId?: CloudId;
    }

    interface OAuth {
      accessToken: string;
      expiresIn: string;
      refreshToken: string;
      scope: string;
      tokenType: string;
    }

    interface OAuthPayload {
      auth: OAuth;
      cloudId: CloudId;
    }

    interface CloudId {
      id: string;
      url: string;
      name: string;
      scopes: string[];
      avatarUrl: string;
    }

    interface Issues {
      issues?: App.Jira.Issue[];
    }

    interface HideStatuses {
      done: boolean;
      unprioritized: boolean;
    }

    interface SettingsStore {
      hideStatuses: HideStatuses;
      filters: App.Jira.FilterableKeys[];
      sprintFieldId?: string;
    }

    interface Meta {
      boards?: App.Jira.SimpleBoard[];
      meta?: App.Jira.Meta[];
    }
  }
}