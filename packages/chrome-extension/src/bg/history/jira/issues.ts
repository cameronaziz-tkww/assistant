import { uuid } from '@utils';
import { formatDistance } from 'date-fns';
import type Jira from '../../jira';
import type Storage from '../../storage';

class IssueHistory {
  private storage: Storage;
  private jira: Jira;

  constructor(jira: Jira, storage: Storage) {
    this.jira = jira;
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
      this.jira.api;
    } catch (error) {
      // Do Nothing
    }
    const local = await this.storage.readProperty('jiraProjects');

    if (!local || !local.watched) {
      return [];
    }

    const { watched } = local;

    const history = await this.jira.api.fetchIssueHistory(watched);
    const changes = history
      .map(
        (relevant): App.History.FeedItem => {
          switch (relevant.item.field) {
            case 'status': {
              return {
                app: 'jira',
                id: uuid(),
                type: 'status',
                createdAt: relevant.created,
                message: [
                  'Issue',
                  {
                    label: relevant.issue.key,
                    url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                    level: 'secondary',
                  },
                  'was moved from',
                  {
                    label: relevant.item.fromString,
                    level: 'quaternary',
                    isFilterable: true,
                  },
                  'to',
                  {
                    label: relevant.item.toString,
                    level: 'quaternary',
                    isFilterable: true,
                  },
                  'by',
                  {
                    label: relevant.author?.displayName || 'Jira Bot',
                    level: 'quaternary',
                  },
                  `${formatDistance(new Date(relevant.created), new Date())} ago`,
                ],
              };
            }
            case 'assignee': {
              return {
                app: 'jira',
                id: uuid(),
                createdAt: relevant.created,
                type: 'assignee',
                message: [
                  'Issue',
                  {
                    label: relevant.issue.key,
                    url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                    level: 'secondary',
                  },
                  'was assigned to',
                  {
                    label: relevant.item.toString,
                    level: 'quaternary',
                    isFilterable: true,
                  },
                  'by',
                  {
                    label: relevant.author?.displayName || 'Jira Bot',
                    level: 'quaternary',
                  },
                  `${formatDistance(new Date(relevant.created), new Date())} ago`,
                ],
              };
            }
            case 'Sprint': {
              return {
                app: 'jira',
                id: uuid(),
                createdAt: relevant.created,
                type: 'sprints',
                message: [
                  'Issue',
                  {
                    label: relevant.issue.key,
                    url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                    level: 'secondary',
                  },
                  'was moved to sprint',
                  {
                    label: relevant.item.toString,
                    level: 'quaternary',
                  },
                  'by',
                  {
                    label: relevant.author?.displayName || 'Jira Bot',
                    level: 'quaternary',
                  },
                  `${formatDistance(new Date(relevant.created), new Date())} ago`,
                ],
              };
            }
            default: {
              console.log(relevant);
              throw Error('Bad');
            }
          }
        },
      );
    return changes;
  }
}

export default IssueHistory;
