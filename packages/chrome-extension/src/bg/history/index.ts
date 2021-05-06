import type Github from '../github';
import type Jira from '../jira';
import type Storage from '../storage';
import Feed from './feed';

class History {
  private storage: Storage;
  private feed: Feed;
  private github: Github;
  private jira: Jira;

  constructor(storage: Storage, github: Github, jira: Jira) {
    this.storage = storage;
    this.jira = jira;
    this.github = github;
    this.feed = new Feed(storage, github, jira);
    this.storage.listen('historyFeed', this.listener);
  }

  listener = (feed: Storage.History.HistoryFeed) => {

  }

  fetch = async (message: Runtime.History.Fetcher): Promise<void> => {
    switch (message.type) {
      case 'history/FEED_FETCH': {
        this.feed.fetch(message);
        break;
      }
    }
  };

  write = async (message: Runtime.History.Setter): Promise<void> => {
    switch (message.type) {
      case 'history/DISMISS_FEED_ITEM': {
        this.feed.write(message);
        break;
      }
    }
  };

}

export default History;
