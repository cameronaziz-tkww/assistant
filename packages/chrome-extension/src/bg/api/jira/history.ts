import { ServiceAPI } from '../../base';
import { isErrorResponse } from '../../jira/utils';

const and = ' AND ';

class IssuesAPI extends ServiceAPI {
  private get URL(): string {
    return `${this.baseUrl}rest/api/3/search`;
  }

  project = (projectKey?: string): string => `project+%3D+${projectKey}`;

  fetch = async (watched: App.Jira.Watched): Promise<API.Jira.Change[]> => {
    const config = Object.entries(watched);
    if (config.length === 0) {
      return [];
    }

    const project = 'project=';
    const status = 'status ';
    const projects = config
      .filter(([, settings]) => settings.statuses.length > 0)
      .map(([projectId, settings]) => settings.statuses.map((statusId) => {
        const base = (state: string) => `${project}${projectId}${and}${status}${state} ${statusId}${and}status CHANGED DURING (-7d, -0d)`;
        return `${base('WAS')}) OR (${base('=')}`;
      }).join(') OR (')).join(') OR (');

    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };

    const url = `${this.URL}?jql=(${projects})&expand=changelog`;
    const response = await fetch(
      url,
      requestOptions,
    );
    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.Response<'issues', API.Jira.Issue, void, API.Jira.ChangeLog>;

    if (isErrorResponse(json)) {
      return [];
    }

    const changes = json.issues
      .reduce(
        (acc, cur) => {
          const { histories } = cur.changelog;
          const relevant = histories
            .filter(
              (item) => {
                const date = new Date();
                date.setDate(date.getDate() - 7);
                const created = new Date(item.created);
                return created.getTime() > date.getTime();
              },
            )
            .map(
              (history) => ({
                ...history,
                issue: cur,
              }),
            );

          acc.push(...relevant);
          return acc;
        },
        [] as API.Jira.Relevant[],
      )
      .reduce(
        (acc, cur) => {
          const relevantChange = cur.items.map(
            (item) => ({
              ...cur,
              item: item,
            }),
          );

          acc.push(...relevantChange);
          return acc;
        },
        [] as API.Jira.Change[],
      );

    return changes
      .filter(
        (change) =>
          change.item.field === 'assignee' ||
          change.item.field === 'status' ||
          change.item.field === 'Sprint',
      );

  }
}

export default IssuesAPI;
