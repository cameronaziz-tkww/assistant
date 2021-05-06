import { chrome, secondsAgo, uniqueBy } from '@utils';
import type { GithubAPI } from '../api';
import type Storage from '../storage';

const LOCAL_TIME = 3600;
const REMOTE_TIME = LOCAL_TIME * 50;

class Repositories {
  private api: GithubAPI;
  private watchedList: Storage.Github.Watched[];
  private repositoriesInstance: Storage.Github.Repositories[];
  private lastLocal: number;
  private lastRemote: number;
  private isRunning: boolean;
  private lastTab: number | undefined;
  private storage: Storage;
  private lastSend: App.Github.Repository[];

  constructor(api: GithubAPI, storage: Storage) {
    chrome.tabs.onActivated.addListener(() => {
      if (this.lastTab) {
        this.lastTab = undefined;
      }
    });
    this.lastLocal = secondsAgo(LOCAL_TIME + 100);
    this.lastSend = [];
    this.lastRemote = secondsAgo(REMOTE_TIME - 100);
    this.storage = storage;
    this.api = api;
    this.repositoriesInstance = [];
    this.watchedList = [];
    this.isRunning = false;
  }

  fetch = async (message: Runtime.Github.RepositoriesFetch): Promise<void> => {
    const needsLocal = secondsAgo(LOCAL_TIME) > this.lastLocal;
    const needsRemote = secondsAgo(REMOTE_TIME) > this.lastRemote;
    const { id } = message.meta;

    this.stateFetch(id, false);

    if (needsLocal || this.repositories.length === 0) {
      this.localFetch(id, !needsRemote);
    }

    if (needsRemote || this.repositories.length === 0) {
      this.remoteFetch(id, true);
    }
  };

  public kill = (): Promise<void> => {
    this.repositoriesInstance = [];
    return this.storage.removeProperty('githubRepositories');
  }

  private prepWatched = (repo: Storage.Github.Repositories): Storage.Github.Watched => ({
    id: repo.id,
    owner: repo.owner,
    name: repo.name,
  });

  write = async (message: Runtime.Github.RepositoriesUpdateWatched): Promise<void> => {
    const { id, nextIsWatched } = message;
    const repo = this.repositoriesInstance.find((repo) => repo.id === id);
    if (!repo) {
      return;
    }

    const watchedIndex = this.watchedList.findIndex((repo) => repo.id === id);
    if (!nextIsWatched) {
      this.watchedList = this.watchedList.splice(watchedIndex, 1);
    }

    if (nextIsWatched && watchedIndex < 0) {
      const watched = this.prepWatched(repo);
      this.watchedList.push(watched);
    }

    this.save(id);

  };

  private convert = (repositories: Storage.Github.Repositories[]) => repositories
    .sort((a, b) => {
      const aName = a.name.toUpperCase();
      const bName = b.name.toUpperCase();

      if (aName < bName) {
        return -1;
      }

      if (aName > bName) {
        return 1;
      }

      return 0;
    })
    .map((repo) => ({
      ...repo,
      isWatched: this.watchedList.findIndex((r) => repo.id === r.id) > -1,
    }));

  private isUnique = (repo: App.Github.Repository): string =>
    `${repo.owner}/${repo.name}`;

  private get repositories(): App.Github.Repository[] {
    return uniqueBy(this.convert(this.repositoriesInstance), this.isUnique);
  }

  private send = (id: string, done: boolean): void => {
    chrome.runtime.respond({
      type: 'github/REPOSITORIES_RESPONSE',
      data: this.repositories,
      meta: {
        id,
        done,
      },
    });
  };

  private stateFetch = (id: string, done: boolean): void => {
    if (this.repositories.length > 0) {
      this.send(id, done);
    }
  };

  private partialResponse = ([id, repositories]: App.Reactor.PartialRepositoryList) => {

    const remoteRepos = this.prep(repositories);

    chrome.runtime.respond({
      type: 'github/REPOSITORIES_RESPONSE',
      data: this.convert(remoteRepos),
      meta: {
        id,
        done: true,
      },
    });
  }

  private localFetch = async (id: string, done: boolean): Promise<void> => {
    const local = await this.storage.readProperty('githubRepositories');
    this.lastLocal = secondsAgo(0);
    this.repositoriesInstance = local?.repositories || [];

    this.watchedList = local?.watchedList || [];

    this.send(id, done);

  };

  private prep = (repositories: API.Github.RepositoryFull[]): Storage.Github.Repositories[] =>
    repositories
      .map(
        (repository): Storage.Github.Repositories => ({
          ...repository,
          owner: repository.owner.login,
          fullName: `${repository.owner.login}/${repository.name}`,
          defaultBranch: repository.defaultBranchRef?.name,
        }),
      );

  private remoteFetch = async (id: string, done: boolean): Promise<void> => {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    const repositories = await this.api.fetchRepositories(id);
    this.lastRemote = secondsAgo(0);
    const remoteRepos = this.prep(repositories);

    this.repositoriesInstance = remoteRepos;
    this.isRunning = false;
    this.send(id, done);
    this.save(id);
  };

  private save = (id: string) => {
    this.storage.setProperty({
      key: 'githubRepositories',
      data: {
        repositories: this.repositories,
        watchedList: this.watchedList,
      },
      meta: {
        id,
      },
      overwrite: true,
    });
  }
}

export default Repositories;
