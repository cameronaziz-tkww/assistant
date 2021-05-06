import { chrome, uuid } from '@utils';
import { ServiceAuth } from '../../base';
import type Storage from '../../storage';

class HoneybadgerAuth extends ServiceAuth {
  private tokenInstance?: string;

  constructor(storage: Storage) {
    super(storage, 'honeybadgerAuth');
    this.tokenInstance = 'c205eHhWSEVvd1RxNU5XMXJQWkg6';
  }

  public get token(): null | string {
    if (this.tokenInstance) {
      return this.tokenInstance;
    }
    return null;
  }

  public destroy = (): void => {
    this.tokenInstance = undefined;
  }

  public register = async (token: string): Promise<void> => {
    this.tokenInstance = token;
  }

  public fetch = async (): Promise<void> => {
    const id = uuid();
    this.stateFetch(id);
    // await this.localFetch(id);
  }

  private stateFetch = (id: string): void => {
    this.send(id);
  };

  private localFetch = async (id: string): Promise<void> => {
    const auth = await this.storage.readProperty('honeybadgerAuth');
    if (this.tokenInstance !== auth?.key) {
      this.tokenInstance = auth?.key;
      this.send(id);
      this.save(id);
    }
  };

  private save = (id: string): void => {
    if (this.token) {
      this.storage.setProperty({
        key: 'honeybadgerAuth',
        data: {
          key: this.token,
        },
        meta: {
          id,
        },
      });
    }
  }

  private send = (id: string) => {
    const isAuth = !!this.token;
    chrome.runtime.respond({
      type: 'jira/IS_AUTHENTICATED',
      isAuthenticated: isAuth,
      meta: {
        done: true,
        id,
      },
    });
  }
}

export default HoneybadgerAuth;