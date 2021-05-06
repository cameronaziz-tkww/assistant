import { ServiceAPI } from '../../base';

class CustomFieldsAPI extends ServiceAPI {
  fetch = async (): Promise<API.Jira.CustomField[]> => {
    const requestOptions: RequestInit = {
      headers: this.headers,
      method: 'GET',
    };
    const response = await fetch(
      `${this.baseUrl}rest/api/2/field`,
      requestOptions,
    );
    const text = await response.text();
    const json = JSON.parse(text) as API.Jira.CustomField[];
    return json;
  }
}

export default CustomFieldsAPI;
