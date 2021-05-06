import { formatDistance } from 'date-fns';
import type Github from '../../github';
import type Storage from '../../storage';

class TagHistory {
  private storage: Storage;
  private github: Github;

  constructor(github: Github, storage: Storage) {
    this.github = github;
    this.storage = storage;
  }

  labelMessage = (labelLength: number): string => {
    switch (labelLength) {
      case 0: return 'with';
      case 1: return 'labeled as a';
      default: return 'labeled as';
    }
  }

  fetch = async (): Promise<App.History.FeedItem[]> => {
    try {
      this.github.api;
    } catch (error) {
      // Do Nothing
    }
    const local = await this.storage.readProperty('githubRepositories');

    if (!local) {
      return [];
    }

    const { watchedList } = local;

    const tags = await this.github.api.fetchTags(watchedList);
    return watchedList
      .map(
        (item): App.History.FeedItem[] => {
          const tag = tags[item.id.replace('=', '')];
          if (!tag) {
            return [];
          }
          return tag.releases.edges.map(
            (edge): App.History.FeedItem => ({
              app: 'github',
              createdAt: edge.node.createdAt,
              id: edge.node.id,
              type: 'release',
              message: [
                'Version',
                {
                  label: edge.node.tag.name,
                  url: edge.node.url,
                  level: 'secondary',
                },
                'was released by',
                {
                  label: edge.node.author.login,
                  level: 'quaternary',
                },
                `${formatDistance(new Date(edge.node.createdAt), new Date())} ago`,
              ],
            }),
          );
        },
      )
      .reduce(
        (acc, cur) => {
          acc.push(...cur);
          return acc;
        },
        [] as App.History.FeedItem[],
      );
  }
}

export default TagHistory;
