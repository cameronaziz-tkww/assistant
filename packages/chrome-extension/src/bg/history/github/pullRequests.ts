import { uuid } from '@utils';
import { formatDistance } from 'date-fns';
import type Github from '../../github';
import type Storage from '../../storage';

class PullRequestHistory {
  private storage: Storage;
  private github: Github;

  constructor(github: Github, storage: Storage) {
    this.github = github;
    this.storage = storage;
  }

  labelMessage = (labelLength: number): string => {
    switch (labelLength) {
      case 0: return 'with';
      default: return 'as';
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

    const history = await this.github.api.fetchPullRequestsHistory(watchedList);

    return history
      .map((item): App.History.FeedItem => {
        const prName = `${item.owner.login}/${item.name}/${item.number}`;
        const labels = item.labels.totalCount == 0 ? [] : item.labels.nodes;
        const tiles = labels.length === 0 ?
          [{
            label: 'NO LABELS',
            level: {
              color: 'ff0000',
            },
          }] :
          labels
            .map(
              (label): App.History.MessagePart => ({
                label: label.name,
                level: {
                  color: label.color,
                },
              }),
            )
            .reduce(
              (acc, cur, index, source) => {
                acc.push(cur);
                if (index + 1 !== source.length) {
                  acc.push('and');
                }
                return acc;
              },
              [] as App.History.MessagePart[],
            );
        switch (item.state) {
          case 'MERGED': {
            return {
              app: 'github',
              id: uuid(),
              type: 'merge',
              createdAt: item.createdAt,
              message: [
                'Pull Request',
                {
                  label: prName,
                  url: item.url,
                  level: 'secondary',
                },
                'was merged by',
                {
                  label: `${item.mergedBy.login}`,
                  level: 'quaternary',
                  isFilterable: true,
                },
                this.labelMessage(labels.length),
                ...tiles,
                `${formatDistance(new Date(item.createdAt), new Date())} ago`,
              ],
            };
          }
          case 'CLOSED': {
            return {
              app: 'github',
              id: uuid(),
              createdAt: item.createdAt,
              type: 'close',
              message: [
                'Pull Request',
                {
                  label: prName,
                  url: item.url,
                  level: 'secondary',
                },
                'was closed by',
                {
                  label: `${item.author.login}`,
                  level: 'quaternary',
                  isFilterable: true,
                },
                `${formatDistance(new Date(item.createdAt), new Date())} ago`,
              ],
            };
          }
          case 'OPEN': {
            return {
              app: 'github',
              id: uuid(),
              type: 'open',
              createdAt: item.createdAt,
              message: [
                'Pull Request',
                {
                  label: prName,
                  url: item.url,
                  level: 'secondary',
                },
                'was created by',
                {
                  label: `${item.author.login}`,
                  level: 'quaternary',
                  isFilterable: true,
                },
                `${formatDistance(new Date(item.createdAt), new Date())} ago`,
              ],
            };
          }
        }
      });
  }
}

export default PullRequestHistory;
