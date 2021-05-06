import axios from 'axios';
import type App from 'types/app';
import { JIRA_CLIENT } from '../../settings';

const URL = 'https://auth.atlassian.com/oauth/token';
const HEADERS = {
  'Content-Type': 'application/json',
};

const refresh = async (refresh: string): Promise<Omit<App.OAuth, 'refreshToken'> | void> => {

  const body = {
    ...JIRA_CLIENT,
    grant_type: 'refresh_token',
    refresh_token: refresh,
  };

  try {
    const response = await axios.post(URL, body, { headers: HEADERS });
    const { data } = response;

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type,
    };
  } catch (error) {
    console.error('refresh error');
  }
};

export default refresh;