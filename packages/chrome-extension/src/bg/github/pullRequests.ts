import { chrome, secondsAgo, uuid } from '@utils';
import type { GithubAPI } from '../api';
import type Storage from '../storage';

const LOCAL_INCREMENT_TIME = 30;
const REMOTE_INCREMENT_TIME = 120;

class PullRequests {
  private api: GithubAPI;
  private pullRequestsInstance: App.Github.PullRequest[];
  private lastLocal: number;
  private lastRemote: number;
  private storage: Storage;
  private isRunning: boolean;

  constructor(api: GithubAPI, storage: Storage) {
    this.storage = storage;
    this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME + 10);
    this.lastRemote = secondsAgo(REMOTE_INCREMENT_TIME + 10);
    this.api = api;
    this.pullRequestsInstance = [];
    this.isRunning = false;
    this.storage.listen('githubRepositories', this.watchGithubRepositories);
  }

  fetch = async (message: Runtime.Github.PullRequestsFetch): Promise<void> => {
    const { id } = message.meta;
    this.stateFetch(id);
    await this.localFetch(id);
    this.remoteFetch(id);
  };

  public kill = (): Promise<void> => {
    /* ~ LOG */ console.log('~ kill', (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
    this.pullRequestsInstance = [];
    return this.storage.removeProperty('githubPullRequests');
  }

  get pullRequests(): App.Github.PullRequest[] {
    return this.pullRequestsInstance;
  }

  private send = (id?: string, done?: boolean): void => {
    chrome.runtime.respond({
      type: 'github/PULL_REQUESTS_RESPONSE',
      data: this.pullRequests,
      meta: {
        done: done || true,
        id: id || uuid(),
      },
    });
  }
  private stateFetch = async (id: string): Promise<void> => {
    if (this.pullRequests.length > 0) {
      this.send(id, false);
    }
  };

  private watchGithubRepositories = async (data: Storage.Github.GithubRepositories | null) => {
    /* ~ LOG */ console.log('~ data', data, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
    if (!data) {
      this.pullRequestsInstance = [];
      this.send();
      return;
    }

    await this.remoteGet('storage-change: githubRepositories', data.watchedList);
    this.send();
  }

  private localFetch = async (id: string | null): Promise<void> => {
    const pullRequests = await this.localGet();
    this.pullRequestsInstance = pullRequests;
    if (!id) {
      return;
    }
    this.send(id, false);
  };

  private localGet = async () => {
    const local = await this.storage.readProperty('githubPullRequests');
    this.lastLocal = new Date().getTime();
    if (local?.pullRequests) {
      const { pullRequests } = local;
      return pullRequests;
    }
    return [];
  };

  private save = (id: string) => {
    this.storage.setProperty({
      key: 'githubPullRequests',
      data: {
        pullRequests: this.pullRequests,
      },
      meta: {
        id,
      },
      overwrite: true,
    });
  };

  private remoteGet = async (id: string, watched: Storage.Github.Watched[]): Promise<void> => {
    /* ~ LOG */ console.log('~ watched', watched, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
    if (!watched || watched.length === 0) {
      this.pullRequestsInstance = [];
      return;
    }

    this.lastRemote = new Date().getTime();
    this.isRunning = true;

    const pullRequests = await this.api.fetchPullRequests(id, watched);

    const clean = pullRequests.map(PullRequests.parsePullRequest);
    this.pullRequestsInstance = clean;
    this.isRunning = false;
  }

  private remoteFetch = async (id: string): Promise<void> => {
    if (this.isRunning) {
      return;
    }

    const local = await this.storage.readProperty('githubRepositories');

    if (!local) {
      return;
    }

    /* ~ LOG */ console.log('~ local', local, (() => { const now = new Date(); return `${now.getSeconds()}.${now.getMilliseconds()}`; })());
    await this.remoteGet(id, local.watchedList);
    this.save(id);
    this.send(id);
  };

  private static parsePullRequest = (pr: API.Github.PullRequest): App.Github.PullRequest => ({
    ...pr,
    approvedCount: pr.reviews.filter((review) => review.state === 'APPROVED').length,
    isRejected: pr.reviews.filter((review) => review.state === 'CHANGES_REQUESTED').length > 0,
    prNumber: pr.number,
    createdBy: pr.author.login,
  });
}

export default PullRequests;
