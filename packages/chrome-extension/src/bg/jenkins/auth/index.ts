import { chrome, uuid } from '@utils';
import type Storage from '../../storage';
import check from './check';
import oAuth from './oAuth';
import refresh from './refresh';

class Auth {
  private storage: Storage;
  private authInstance?: Storage.Jira.OAuth;
  private cloudIdInstance?: Storage.Jira.CloudId;
  private lastIsAuth: boolean;

  constructor(storage: Storage) {
    this.lastIsAuth = false;
    this.storage = storage;
    this.storage.listen('jiraAuth', this.watchAuth);
  }

  private get token(): null | string {
    if (this.authInstance) {
      return this.authInstance.accessToken;
    }
    return null;
  }

  private get refreshToken(): undefined | string {
    if (this.authInstance) {
      return this.authInstance.refreshToken;
    }
    return;
  }

  private get cloudId(): undefined | string {
    if (this.cloudIdInstance) {
      return this.cloudIdInstance.id;
    }
    return;
  }

  private get appUrl(): undefined | string {
    if (this.cloudIdInstance) {
      return this.cloudIdInstance.url;
    }
    return;
  }

  public get api(): API.Jira.API | null {
    if (!this.token || !this.cloudId || !this.appUrl) {
      return null;
    }

    return {
      cloudId: this.cloudId,
      token: this.token,
      appUrl: this.appUrl,
    };
  }

  private watchAuth = (value: Storage.Jira.AuthStore): void => {
    if (!value) {
      this.destroy();
    }
  };

  public destroy = (): void => {
    this.authInstance = undefined;
    this.cloudIdInstance = undefined;
  }

  public register = async (message: Runtime.Jira.AuthenticateRequest): Promise<void> => {
    chrome.runtime.respond({
      type: 'error/SERVICE_ERROR',
      message: 'Personal Access Tokens for Jira are not supported at this time.',
      unit: 'jira',
      meta: {
        id: message.meta.id,
        done: true,
      },
    });
  }

  public fetch = async (): Promise<void> => {
    this.stateFetch();
    await this.localFetch();
  }

  check = async (): Promise<void> => {
    if (this.api) {
      const success = await check(this.api.token);
      if (!success && this.refreshToken) {
        this.refresh();
      }
    }
  }

  refresh = async (): Promise<void> => {
    if (!this.refreshToken) {
      await this.localFetch();
    }
    if (!this.refreshToken) {
      return;
    }

    const nextToken = await refresh(this.refreshToken);
    const id = uuid();
    this.receive(nextToken);
    this.save(id);
  }

  save = (id: string): void => {
    if (this.cloudIdInstance && this.authInstance) {
      this.storage.setProperty({
        key: 'jiraAuth',
        data: {
          OAuth: this.authInstance,
          cloudId: this.cloudIdInstance,
        },
        meta: {
          id,
        },
      });
    }
  }

  oAuth = async (message: Runtime.Jira.AuthenticateRequest): Promise<void> => {
    const { meta: { id } } = message;
    const response = await oAuth();

    if (typeof response === 'string') {
      chrome.runtime.respond({
        type: 'error/SERVICE_ERROR',
        message: response,
        unit: 'jira',
        meta: {
          id,
          done: true,
        },
      });
      return;
    }

    this.receive(response.auth, response.cloudId);
    this.save(id);
  };

  private receive = (auth: Storage.Jira.OAuth | Omit<Storage.Jira.OAuth, 'refreshToken'>, cloudIdParam?: Storage.Jira.CloudId) => {
    const refreshToken = this.refreshToken || 'NO_REFRESH_TOKEN';
    this.authInstance = {
      refreshToken,
      ...auth,
    };

    if (cloudIdParam) {
      this.cloudIdInstance = cloudIdParam;
    }

    this.send();
  }

  private send = () => {
    const isAuth = !!this.token && !!this.cloudId;

    if (isAuth !== this.lastIsAuth) {
      this.lastIsAuth = isAuth;
      chrome.runtime.respond({
        type: 'jira/IS_AUTHENTICATED',
        isAuthenticated: isAuth,
        meta: {
          done: true,
          id: uuid(),
        },
      });
    }
  }

  private stateFetch = (): void => {
    this.send();
  };

  private localFetch = async (): Promise<void> => {
    const auth = await this.storage.readProperty('jiraAuth');
    if (auth?.OAuth) {
      this.receive(auth.OAuth, auth.cloudId);
      this.check();
    }
  };
}

export default Auth;