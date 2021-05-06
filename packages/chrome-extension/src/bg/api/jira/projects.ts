import { ServiceAPI } from '../../base';

class ProjectsAPI extends ServiceAPI {
  fetch = async (): Promise<API.Jira.Project[]> => this.fetchMore([], 0);

  fetchMore = async (current: API.Jira.Project[], startAt: number): Promise<API.Jira.Project[]> => {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };
    const response = await fetch(
      `${this.baseUrl}rest/api/3/project/search?startAt=${startAt}`,
      requestOptions,
    );
    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.PaginationResponse<API.Jira.Project>;
    const { values, isLast } = json;
    const next = [...current, ...values];

    if (isLast) {
      return next;
    }

    return this.fetchMore(next, startAt + values.length);
  }
}

export default ProjectsAPI;
