import axios from 'axios';
import type App from 'types/app';

const URL = 'https://api.atlassian.com/oauth/token/accessible-resources';
const HEADERS = {
  Accept: 'application/json',
};

const cloudId = async (token: string): Promise<App.CloudId[]> => {

  const headers = {
    ...HEADERS,
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.get(URL, { headers });

  return response.data;
};

export default cloudId;