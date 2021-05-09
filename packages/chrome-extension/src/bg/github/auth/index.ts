import { chrome, uuid } from '@utils';
import type Storage from '../../storage';
import oAuth from './oAuth';
// import refresh from './refresh';
import tokenVerify from './tokenVerify';

class Auth {
  private storage: Storage;
  private oAuthInstance?: Storage.Github.OAuth;
  private personalAccessTokenInstance?: string;
  private isAuth: boolean;

  constructor(storage: Storage) {
    this.storage = storage;
    this.isAuth = false;
    this.storage.listen('githubAuth', this.watchAuth);
  }

  public get token(): null | string {
    if (!this.isAuth) {
      return null;
    }

    if (this.personalAccessTokenInstance) {
      return this.personalAccessTokenInstance;
    }

    if (this.oAuthInstance) {
      return this.oAuthInstance.accessToken;
    }

    return null;
  }

  private get refreshToken(): undefined | string {
    if (this.oAuthInstance) {
      return this.oAuthInstance.refreshToken;
    }
    return;
  }

  public kill = (): Promise<void> => {
    this.isAuth = false;
    return this.storage.removeProperty('githubAuth');
  }

  private watchAuth = (value: Storage.Github.AuthStore | null): void => {
    if (!value) {
      this.destroy();
    }
  };

  public destroy = (): void => {
    this.oAuthInstance = undefined;
  }

  public fetch = async (): Promise<void> => {
    this.stateFetch();
    await this.localFetch();
  }

  public check = async (): Promise<void> => {
    const isAuth = !!this.token;
    if (!isAuth) {
      await this.fetch();
    }
    this.send();
  }
  w
  private save = (id: string): void => {
    if (this.oAuthInstance) {
      this.storage.setProperty({
        key: 'githubAuth',
        data: {
          OAuth: this.oAuthInstance,
          personalAccessToken: this.personalAccessTokenInstance,
        },
        meta: {
          id,
        },
      });
    }
  }

  public oAuth = async (message: Runtime.Github.AuthenticateRequest): Promise<boolean> => {
    const { meta: { id } } = message;
    const response = await oAuth();

    if (typeof response === 'string') {
      chrome.runtime.respond({
        type: 'error/SERVICE_ERROR',
        message: response,
        unit: 'github',
        meta: {
          id,
          done: true,
        },
      });
      return false;
    }
    // this.oAuthInstance = {
    //   ...response.auth,
    //   refreshToken,
    // };

    // this.receive(response);
    this.save(id);
    return true;
  };

  public pat = async (message: Runtime.Github.AuthenticateRequest, token: string): Promise<boolean> => {
    const { meta: { id } } = message;
    const tokenAuth = await tokenVerify(token);
    if (tokenAuth) {
      this.personalAccessTokenInstance = tokenAuth;
      this.save(id);
      return true;
    }
    return false;
  }

  private receive = (auth: Storage.Github.AuthStore) => {
    const refreshToken = this.refreshToken || 'NO_REFRESH_TOKEN';
    if (auth.OAuth?.accessToken) {
      this.oAuthInstance = {
        ...auth.OAuth,
        refreshToken,
      };
    }

    if (auth.personalAccessToken) {
      this.personalAccessTokenInstance = auth.personalAccessToken;
    }

    this.send();
  }

  private send = () => {
    const isAuth = !!this.token;

    chrome.runtime.respond({
      type: 'github/IS_AUTHENTICATED',
      isAuthenticated: isAuth,
      meta: {
        done: true,
        id: uuid(),
      },
    });
  }

  private stateFetch = (): void => {
    this.send();
  };

  private localFetch = async (): Promise<void> => {
    const auth = await this.storage.readProperty('githubAuth');
    if (auth) {
      this.isAuth = true;
      this.receive(auth);
    }
  };
}

export default Auth;