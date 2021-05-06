import { JIRA_BASE_URL } from '@settings';
import type Auth from '../../jira/auth';
import CustomFieldsAPI from './customFields';
import HistoryAPI from './history';
import IssuesAPI from './issues';
import ProjectsAPI from './projects';
import StatusesAPI from './statuses';

interface Query<T, U extends unknown[]> {
  (...args: U): Promise<T[]>
}

class APIApp {
  private issuesAPIInstance?: IssuesAPI;
  private projectsAPIInstance?: ProjectsAPI;
  private statusesAPIInstance?: StatusesAPI;
  private customFieldsAPIInstance?: CustomFieldsAPI;
  private historyAPIInstance?: HistoryAPI;
  private isAuth: boolean;
  private auth: Auth

  constructor(auth: Auth) {
    this.auth = auth;
    this.isAuth = true;
  }

  private get baseUrlAuth(): string {
    return `${JIRA_BASE_URL}${this.authAPI.cloudId}/`;
  }

  private get authAPI(): API.Jira.API {
    if (!this.auth.api) {
      throw new Error('No Token in Jira - Don\'t forget to call start');
    }

    this.isAuth = true;
    return this.auth.api;
  }

  private get token() {
    return this.authAPI.token;
  }

  public get appUrl(): string {
    return this.authAPI.appUrl;
  }

  public destroy = (): void => {
    this.isAuth = false;
    this.issuesAPIInstance = undefined;
    this.projectsAPIInstance = undefined;
    this.statusesAPIInstance = undefined;
    this.historyAPIInstance = undefined;
  }

  private fetch = async <T, U extends unknown[]>(retry: boolean, query: Query<T, U>, ...args: U): Promise<T[]> => {
    try {
      return query(...args);
    } catch (error) {
      if (retry) {
        await this.auth.refresh();
        return this.fetch(false, query, ...args);
      }
      return [];
    }
  }

  public fetchIssues = async (watched: App.Jira.Watched): Promise<API.Jira.Issue[]> => this.fetch(true, this.issuesAPI.fetch, watched);
  public fetchIssueHistory = async (watched: App.Jira.Watched): Promise<API.Jira.Change[]> => this.fetch(true, this.historyAPI.fetch, watched);
  public fetchProjects = async (): Promise<API.Jira.Project[]> => this.fetch(true, this.projectsAPI.fetch);
  public fetchStatuses = async (projectIdOrKey: string | number): Promise<API.Jira.StatusResponse[]> => this.fetch(true, this.statusesAPI.fetch, projectIdOrKey);
  public fetchCustomFields = async (): Promise<API.Jira.CustomField[]> => this.fetch(true, this.customFieldsAPI.fetch);

  private get issuesAPI(): IssuesAPI {
    if (!this.issuesAPIInstance) {
      this.issuesAPIInstance = new IssuesAPI(this.baseUrlAuth, this.headers);
    }
    return this.issuesAPIInstance;
  }

  private get projectsAPI(): ProjectsAPI {
    if (!this.projectsAPIInstance) {
      this.projectsAPIInstance = new ProjectsAPI(this.baseUrlAuth, this.headers);
    }
    return this.projectsAPIInstance;
  }

  private get statusesAPI(): StatusesAPI {
    if (!this.statusesAPIInstance) {
      this.statusesAPIInstance = new StatusesAPI(this.baseUrlAuth, this.headers);
    }
    return this.statusesAPIInstance;
  }

  private get customFieldsAPI(): CustomFieldsAPI {
    if (!this.customFieldsAPIInstance) {
      this.customFieldsAPIInstance = new CustomFieldsAPI(this.baseUrlAuth, this.headers);
    }
    return this.customFieldsAPIInstance;
  }

  private get historyAPI(): HistoryAPI {
    if (!this.historyAPIInstance) {
      this.historyAPIInstance = new HistoryAPI(this.baseUrlAuth, this.headers);
    }
    return this.historyAPIInstance;
  }

  private get headers() {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${this.token}`);
    headers.append('Accept', 'application/json');
    return headers;
  }
}

export default APIApp;
