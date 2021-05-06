import axios from 'axios';
import type App from 'types/app';
import { GITHUB_CLIENT, JIRA_CLIENT } from '../../settings';

interface AuthParams {
  code: string;
  redirect: string;
}

const HEADERS = {
  'Content-Type': 'application/json',
};

const oAuth = async (params: AuthParams, isJira: boolean): Promise<App.OAuth | void> => {
  const url = isJira ?
    'https://auth.atlassian.com/oauth/token' :
    'https://github.com/login/oauth/access_token';

  const { code, redirect } = params;
  if (!code || !redirect) {
    return;
  }

  const client = isJira ? JIRA_CLIENT : GITHUB_CLIENT;

  const body = {
    ...client,
    grant_type: isJira ? 'authorization_code' : undefined,
    code,
    redirect_uri: redirect,
  };

  try {
    const response = await axios.post(url, body, { headers: HEADERS });
    const { data } = response;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type,
    };
  } catch (error) {
    console.error('errorerrorerrorerrorerror');
  }
};

export default oAuth;