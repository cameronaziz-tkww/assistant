import { chrome, secondsAgo, uuid } from '@utils';
import type Github from '../github';
import type Jira from '../jira';
import type Storage from '../storage';
import PullRequestHistory from './github/pullRequests';
import TagsHistory from './github/tags';
import IssuesHistory from './jira/issues';

const LOCAL_INCREMENT_TIME = 30;

class Feed {
  private lastLocal: number;
  private pullRequestHistoryInstance?: PullRequestHistory;
  private tagsHistoryInstance?: TagsHistory;
  private issuesHistoryInstance?: IssuesHistory;
  private storage: Storage;
  private feedInstance: App.History.FeedItem[];
  private github: Github;
  private jira: Jira;

  constructor(storage: Storage, github: Github, jira: Jira) {
    this.jira = jira;
    this.github = github;
    this.storage = storage;
    this.feedInstance = [];
    this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME + 10);
  }

  public fetch = async (message: Runtime.History.FeedFetch): Promise<void> => {
    const { id } = message.meta;
    this.stateFetch(id);
    await this.localFetch(id);
    this.remoteFetch();
  };

  public write = async (message: Runtime.History.DismissFeedItem): Promise<void> => {
    const { meta: { id }, feedItemId } = message;
    this.feedInstance = this.feedInstance.filter((item) => item.id !== feedItemId);
    this.send(id, true);
    this.save(id);
  };

  public kill = (): Promise<void> => {
    this.feedInstance = [];
    return this.storage.removeProperty('historyFeed');
  }

  private send = (id: string, done: boolean): void => {
    chrome.runtime.respond({
      type: 'history/FEED_RESPONSE',
      data: this.feed,
      meta: {
        done,
        id,
      },
    });
  }
  private stateFetch = async (id: string): Promise<void> => {
    if (this.feed.length > 0) {
      this.send(id, false);
    }
  };

  private localFetch = async (id: string | null): Promise<void> => {
    const feed = await this.localGet();
    this.feedInstance = feed;
    if (!id) {
      return;
    }
    this.send(id, false);
  };

  private localGet = async () => {
    const local = await this.storage.readProperty('historyFeed');
    this.lastLocal = new Date().getTime();
    if (local?.feed) {
      const { feed } = local;
      return feed;
    }
    return [];
  };

  private remoteFetch = async () => {
    const issues = await this.issuesHistory.fetch();
    const tags = await this.tagsHistory.fetch();
    const pullRequests = await this.pullRequestHistory.fetch();
    const data = [...tags, ...pullRequests, ...issues];
    data.sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);
      if (aDate > bDate) {
        return -1;
      }
      if (aDate < bDate) {
        return 1;
      }
      return 0;
    });
    this.feedInstance = data;
    this.save(uuid());
    this.send(uuid(), true);
  }

  private save = (id: string) => {
    this.storage.setProperty({
      key: 'historyFeed',
      data: {
        feed: this.feed,
      },
      meta: {
        id,
      },
      overwrite: true,
    });
  };

  private get feed() {
    return this.feedInstance;
  }

  private get pullRequestHistory(): PullRequestHistory {
    if (!this.pullRequestHistoryInstance) {
      this.pullRequestHistoryInstance = new PullRequestHistory(this.github, this.storage);
    }
    return this.pullRequestHistoryInstance;
  }

  private get tagsHistory(): TagsHistory {
    if (!this.tagsHistoryInstance) {
      this.tagsHistoryInstance = new TagsHistory(this.github, this.storage);
    }
    return this.tagsHistoryInstance;
  }

  private get issuesHistory(): IssuesHistory {
    if (!this.issuesHistoryInstance) {
      this.issuesHistoryInstance = new IssuesHistory(this.jira, this.storage);
    }
    return this.issuesHistoryInstance;
  }
}

export default Feed;
