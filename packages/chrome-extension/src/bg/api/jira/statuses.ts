import { ServiceAPI } from '../../base';

class StatusesAPI extends ServiceAPI {

  fetch = async (projectIdOrKey: string | number): Promise<API.Jira.StatusResponse[]> => {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };
    const response = await fetch(
      `${this.baseUrl}rest/api/3/project/${projectIdOrKey}/statuses`,
      requestOptions,
    );
    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.StatusResponse[];
    return json;
  }
}

export default StatusesAPI;
