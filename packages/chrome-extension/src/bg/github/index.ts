import { chrome, Reactor } from '@utils';
import { GithubAPI } from '../api';
import type Storage from '../storage';
import Auth from './auth';
import PullRequests from './pullRequests';
import Repositories from './repositories';

class Github {
  private reactor: Reactor<App.Github.Reactors>;
  private apiInstance?: GithubAPI;
  private storage: Storage;
  private repositoriesInstance?: Repositories;
  private pullRequestsInstance?: PullRequests;
  private auth: Auth;
  // private history: History;
  private pendingFetches: Set<Runtime.Github.Fetcher>

  constructor(storage: Storage) {
    // this.history = history;
    this.storage = storage;
    this.reactor = new Reactor();
    this.auth = new Auth(this.storage);
    this.start();
    this.pendingFetches = new Set();
  }

  fetch = async (message: Runtime.Github.Fetcher): Promise<void> => {
    if (message.type === 'github/AUTHENTICATE_REQUEST') {
      await this.authenticate(message);
      return;
    }

    if (message.type === 'github/AUTHENTICATE_CHECK') {
      this.auth.check();
      return;
    }

    if (message.type === 'github/LOGOUT') {
      this.killCurrent();
      return;
    }

    if (!this.auth.token) {
      await this.start();
      if (!this.auth.token) {
        chrome.runtime.respond({
          type: 'github/IS_AUTHENTICATED',
          isAuthenticated: false,
          meta: {
            id: message.meta.id,
            done: true,
          },
        });
        return;
      }
    }

    switch (message.type) {
      case 'github/PULL_REQUESTS_FETCH': {
        this.pullRequests.fetch(message);
        break;
      }
      case 'github/REPOSITORIES_FETCH': {
        this.repositories.fetch(message);
        break;
      }
    }
  };

  write = async (message: Runtime.Github.Setter): Promise<void> => {
    switch (message.type) {
      case 'github/REPOSITORIES_UPDATE_WATCHED': {
        this.repositories.write(message);
        break;
      }
    }
  };

  private authenticate = async (message: Runtime.Github.AuthenticateRequest): Promise<void> => {
    if (!message.token) {
      await this.auth.oAuth(message);
    }

    if (message.token) {
      await this.auth.pat(
        message,
        message.token,
      );
    }

    this.pendingFetches.forEach((message) => {
      this.fetch(message);
    });

  };

  private killCurrent = async () => {
    await this.pullRequests.kill();
    await this.repositories.kill();
    await this.auth.kill();
  };

  private start = async (): Promise<void> => {
    await this.auth.fetch();
  };

  private get token(): string {
    if (!this.auth.token) {
      throw new Error('No Token in Github - Don\'t forget to call start');
    }

    return this.auth.token;
  }

  get api(): GithubAPI {
    if (!this.apiInstance) {
      this.apiInstance = new GithubAPI(this.token, this.reactor);
    }
    return this.apiInstance;
  }

  private get repositories(): Repositories {
    if (!this.repositoriesInstance) {
      this.repositoriesInstance = new Repositories(this.api, this.storage);
    }
    return this.repositoriesInstance;
  }

  private get pullRequests(): PullRequests {
    if (!this.pullRequestsInstance) {
      this.pullRequestsInstance = new PullRequests(this.api, this.storage);
    }
    return this.pullRequestsInstance;
  }
}

export default Github;
