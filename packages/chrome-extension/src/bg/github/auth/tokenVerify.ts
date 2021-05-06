import { chrome } from '@utils';
const GITHUB_BASE_URL = 'https://api.github.com/';

const getToken = async (maybeToken?: string) => {
  if (maybeToken) {
    return maybeToken;
  }

  const chromeSettings = await chrome.storage.get('githubAuth');
  return chromeSettings?.data.personalAccessToken;
};

const tokenVerify = async (maybeToken: string): Promise<Storage.Github.AuthStore['personalAccessToken']> => {
  const personalAccessToken = await getToken(maybeToken);

  if (personalAccessToken) {
    const method = 'GET';
    const headers = new Headers();
    headers.append('Authorization', `token ${personalAccessToken}`);

    const requestOptions: RequestInit = {
      headers,
      method,
    };

    const response = await fetch(
      GITHUB_BASE_URL,
      requestOptions,
    );

    if (response.status !== 200) {
      return;
    }

    if (maybeToken) {
      chrome.storage.set('githubAuth', { personalAccessToken });
    }

    return personalAccessToken;
  }
};

export default tokenVerify;
