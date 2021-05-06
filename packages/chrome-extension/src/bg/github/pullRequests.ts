import { chrome, secondsAgo } from '@utils';
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
    chrome.storage.addListener('githubRepositories', this.watchGithubRepositories);
  }

  fetch = async (message: Runtime.Github.PullRequestsFetch): Promise<void> => {
    const { id } = message.meta;
    this.stateFetch(id);
    await this.localFetch(id);
    this.remoteFetch(id);
  };

  public kill = (): Promise<void> => {
    this.pullRequestsInstance = [];
    return this.storage.removeProperty('githubPullRequests');
  }

  get pullRequests(): App.Github.PullRequest[] {
    return this.pullRequestsInstance;
  }

  private send = (id: string, done: boolean): void => {
    chrome.runtime.respond({
      type: 'github/PULL_REQUESTS_RESPONSE',
      data: this.pullRequests,
      meta: {
        done,
        id,
      },
    });
  }
  private stateFetch = async (id: string): Promise<void> => {
    if (this.pullRequests.length > 0) {
      this.send(id, false);
    }
  };

  private watchGithubRepositories = async (changes: Storage.Change<'githubRepositories'>) => {
    const { newValue } = changes;
    this.pullRequestsInstance = [];
    if (newValue) {
      this.remoteGet('storage-change: githubRepositories', newValue.watchedList);
    }
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
    if (!watched || watched.length === 0) {
      this.pullRequestsInstance = [];
      this.save(id);
      return;
    }

    this.lastRemote = new Date().getTime();
    this.isRunning = true;

    const pullRequests = await this.api.fetchPullRequests(id, watched);

    const clean = pullRequests.map(PullRequests.parsePullRequest);
    this.pullRequestsInstance = clean;
    this.isRunning = false;
    this.save(id);
  }

  private remoteFetch = async (id: string): Promise<void> => {
    if (this.isRunning) {
      return;
    }

    const local = await this.storage.readProperty('githubRepositories');

    if (!local) {
      return;
    }

    await this.remoteGet(id, local.watchedList);
    this.send(id, true);

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
