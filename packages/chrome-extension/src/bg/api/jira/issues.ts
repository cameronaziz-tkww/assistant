import { ServiceAPI } from '../../base';
import { isErrorResponse } from '../../jira/utils';

const and = '+AND+';

class IssuesAPI extends ServiceAPI {
  private get URL(): string {
    return `${this.baseUrl}rest/api/3/search`;
  }

  project = (projectKey?: string): string => `project+%3D+${projectKey}`;
  sprint = (sprintId?: number): string => `Sprint+%3D+${sprintId}${and}`;

  fetch = async (watched: App.Jira.Watched): Promise<API.Jira.Issue[]> => {
    const config = Object.entries(watched);
    if (config.length === 0) {
      return [];
    }

    const project = 'project%20%3D%20';
    const status = 'status+%3D+';
    const projects = config
      .filter(([, settings]) => settings.statuses.length > 0)
      .map(([projectId, settings]) => settings.statuses.map((statusId) => `${project}${projectId}%20AND%20${status}${statusId}`).join(') OR (')).join(') OR (');

    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };

    const url = `${this.URL}?jql=(${projects})`;
    const response = await fetch(
      url,
      requestOptions,
    );
    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.Response<'issues', API.Jira.Issue>;
    if (isErrorResponse(json)) {
      return [];
    }
    return json.issues;
  }
}

export default IssuesAPI;
