import { ServiceAPI } from '../../base';
import { isErrorResponse } from '../../jira/utils';

class IssuesAPI extends ServiceAPI {
  private get URL(): string {
    return `${this.baseUrl}rest/api/3/search`;
  }

  fetch = async (watched: App.Jira.Watched): Promise<API.Jira.Issue[]> => {

    const config = Object.entries(watched);
    if (config.length === 0) {
      return [];
    }
    this.isFetching = true;

    const project = 'project%20%3D%20';
    const status = 'status+%3D+';
    const projects = config
      .filter(([, settings]) => settings.statuses.length > 0)
      .map(([projectId, settings]) => settings.statuses.map((statusId) => `${project}${projectId}%20AND%20${status}${statusId}`).join(') OR (')).join(') OR (');

    return this.fetchMore([], projects, 0);

  }

  private fetchMore = async (
    current: API.Jira.Issue[],
    projects: string,
    start: number,
  ): Promise<API.Jira.Issue[]> => {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };

    const url = `${this.URL}?jql=(${projects})&startAt=${start}`;
    const response = await fetch(
      url,
      requestOptions,
    );

    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.Response<'issues', API.Jira.Issue, API.Jira.SuccessMeta>;
    if (isErrorResponse(json)) {
      this.isFetching = false;
      return current;
    }

    const { issues, startAt, maxResults } = json;

    current.push(...issues);

    if (issues.length === maxResults) {
      return this.fetchMore(current, projects, startAt + maxResults);
    }

    this.isFetching = false;
    return current;
  }
}

export default IssuesAPI;
