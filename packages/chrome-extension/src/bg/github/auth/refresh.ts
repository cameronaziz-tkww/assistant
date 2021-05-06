import { SERVICE_ENDPOINT } from '@settings';

const refresh = async (refreshToken: string): Promise<Omit<Storage.Jira.OAuth, 'refreshToken'>> => {

  const requestOptions: RequestInit = {
    method: 'GET',
  };

  const url = `${SERVICE_ENDPOINT}jira-refresh?refresh=${refreshToken}`;
  const response = await fetch(
    url,
    requestOptions,
  );
  const text = await response.text();
  const data = JSON.parse(text) as Omit<Storage.Jira.OAuth, 'refreshToken'>;

  return data;

};

export default refresh;