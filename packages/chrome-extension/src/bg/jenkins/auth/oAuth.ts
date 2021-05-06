import { JIRA_CLIENT_ID, SERVICE_ENDPOINT } from '@settings';
import { chrome, url, uuid } from '@utils';

const { encode, decode } = url;

interface Params {
  [key: string]: string;
}

interface ParseResult {
  params: Params;
  redirect: string;
}

const fetchToken = async (code: string, redirect: string): Promise<Storage.Jira.OAuthPayload> => {
  const requestOptions: RequestInit = {
    method: 'GET',
  };

  const url = `${SERVICE_ENDPOINT}jira-oauth?code=${encode(code)}&redirect=${encode(redirect)}`;
  const response = await fetch(
    url,
    requestOptions,
  );
  const text = await response.text();
  const data = JSON.parse(text) as Storage.Jira.OAuthPayload;

  return data;
};

const getParams = (url: string): ParseResult | null => {
  const urlParts = url.split('?');
  const [redirect, query] = urlParts;
  const params: Params = {};
  if (!query) {
    return null;
  }
  const hash = query.split('&');

  for (let i = 0; i < hash.length; i += 1) {
    const value = hash[i].split('=');
    params[value[0]] = value[1];
  }

  return {
    redirect,
    params,
  };
};

const getError = (message: string): string => {
  switch (message) {
    case 'Authorization page could not be loaded.': return 'It looks like our servers are down, try again later, try again later.';
    case 'bad-response': return 'It looks like Atlassian sent a bad response, try again.';
    case 'bad-state': return 'It looks like something fishy is going on with the response, try again..';
    case 'User did not authorize the request': return 'It looks like you didn\'t authorize our app, try again.';
    default: return 'It looks like an error happened, try again.';
  }
};

const parseCallbackError = <T extends Params>(params: T) => {
  const message = decode(params.error_description);
  return getError(message);
};

const display = async (url: string, state: string): Promise<Storage.Jira.OAuthPayload | string> => {
  const { lastError } = chrome.runtime;
  if (lastError && Object.keys(lastError)) {
    return getError(lastError.message);
  }

  const result = getParams(url);
  if (!result) {
    return getError('bad-response');
  }
  const { params, redirect } = result;

  if (params?.state !== state) {
    return getError('bad-state');
  }

  if (params.error) {
    return parseCallbackError(params);
  }

  const authResponse = await fetchToken(params.code, redirect);

  return authResponse;
};

const OAuth = async (): Promise<Storage.Jira.OAuthPayload | string> => new Promise((resolve, reject) => {
  const redirectUri = chrome.identity.getRedirectURL('provider_cb');

  const state = uuid();
  const scope = [
    'offline_access',
    'read:jira-user',
    'read:jira-work',
  ].join(' ');

  const audience = 'api.atlassian.com';
  const respoonseType = 'code';
  const prompt = 'consent';
  const query = `audience=${audience}&client_id=${JIRA_CLIENT_ID}&scope=${encode(scope)}&redirect_uri=${encode(redirectUri)}&state=${state}&response_type=${respoonseType}&prompt=${prompt}`;
  const url = `https://auth.atlassian.com/authorize?${query}`;

  const options: Chrome.Identity.WebAuthFlowDetails = {
    interactive: true,
    url,
  };

  chrome.identity.launchWebAuthFlow(options, async (redirectUri: string) => {
    const settings = await display(redirectUri, state);
    if (!settings) {
      reject(settings);
      return;
    }
    resolve(settings);
  });

});

export default OAuth;
