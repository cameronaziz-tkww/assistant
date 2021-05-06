import { chrome, Reactor, secondsAgo } from '@utils';
import EventEmitter from 'eventemitter3';
import type { JiraAPI } from '../api';
import type Storage from '../storage';

const LOCAL_INCREMENT_TIME = 30;
const REMOTE_INCREMENT_TIME = 120;

class Issues {
  private api: JiraAPI;
  private storage: Storage;
  private issuesInstance: App.Jira.Issue[] = [];
  private isRunning = false;
  private lastLocal: number;
  private reactor: Reactor<App.Jira.Reactors>;
  private lastRemote: number;
  private hideStatuses: Storage.Jira.HideStatuses;
  private waiter: EventEmitter;
  private watched: App.Jira.Watched
  private hasWatched: boolean;

  constructor(api: JiraAPI, reactor: Reactor<App.Jira.Reactors>, storage: Storage) {
    this.reactor = reactor;
    this.api = api;
    this.storage = storage;
    this.hideStatuses = {
      done: true,
      unprioritized: true,
    };
    this.watched = {};
    this.hasWatched = false;
    this.waiter = new EventEmitter();
    this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME + 10);
    this.lastRemote = secondsAgo(REMOTE_INCREMENT_TIME + 10);
    this.storage.listen('jiraProjects', this.watchSettings);
    this.storage.listen('jiraSettings', this.watchSettings);
    this.reactor.addEventListener('watched-updated', this.busIt);
  }

  private busIt = () => {
    this.waiter.emit('unlocked');
    this.hasWatched = true;
  }

  private get issues(): App.Jira.Issue[] {
    return this.issuesInstance.filter((issue) => {
      const filters = this.watched[issue.projectId]?.filters;
      if (!filters) {
        return true;
      }
      const { onlyAssigned, onlyActive } = filters;
      if (onlyActive && !issue.sprints.some((sprint) => sprint.state === 'active')) {
        return false;
      }

      if (onlyAssigned && (!issue.assignee || issue.assignee === 'UNASSIGNED')) {
        return false;
      }
      return true;
    });
  }

  private watchSettings = async (): Promise<void> => {
    this.issuesInstance = [];
    this.fetchIssues('storage-change: jiraSettings');
  };

  public destroy = async (): Promise<void> => {
    this.issuesInstance = [];
    await this.storage.removeProperty('jiraIssues');
    this.send('destory', true);
  }

  public fetch = async (message: Runtime.Jira.IssuesFetch): Promise<void> => {
    const { id } = message.meta;
    this.fetchIssues(id);
  };

  private fetchIssues = async (id: string) => {
    this.stateFetch(id);
    await this.localFetch(id);
    await this.remoteFetch(id);
  }

  private send = (id: string, done: boolean): void => {
    chrome.runtime.respond({
      type: 'jira/ISSUES_RESPONSE',
      data: this.issues,
      meta: {
        done,
        id,
      },
    });
  }

  private stateFetch = (id: string): void => {
    if (this.issues.length > 0) {
      this.send(id, false);
    }
  };

  private localFetch = async (id: string): Promise<void> => {
    this.lastLocal = new Date().getTime();
    const jiraSettings = await this.storage.readProperty('jiraIssues');
    if (jiraSettings?.issues && jiraSettings?.issues.length > 0) {
      const { issues } = jiraSettings;

      this.issuesInstance = issues;
      this.send(id, false);
    }
  };

  private store = (id: string) => {
    this.storage.setProperty({
      key: 'jiraIssues',
      data: {
        issues: this.issues,
      },
      overwrite: true,
      meta: {
        id,
      },
    });
  };

  private remoteFetch = async (id: string): Promise<void> => {
    if (this.isRunning) {
      this.send(id, true);
      return;
    }

    this.isRunning = true;

    const projects = await this.storage.readProperty('jiraProjects');
    if (!projects) {
      this.send(id, true);
      return;
    }

    const { watched } = projects;
    this.watched = watched;
    const data = await this.api.fetchIssues(watched);
    const issues = await this.cleanResponse(data);
    this.issuesInstance = issues;
    this.send(id, true);
    this.store(id);
    this.lastRemote = secondsAgo(0);
    this.isRunning = false;
  };

  private cleanResponse = async (response: API.Jira.Issue[]): Promise<App.Jira.Issue[]> => {
    const settings = await this.storage.readProperty('jiraSettings');
    const sprintId = settings ? settings.sprintFieldId : null;

    return response.map(
      (issue) => ({
        projectId: issue.fields.project.id,
        createdAt: issue.fields.created,
        id: issue.id,
        projectKey: issue.fields.project.key,
        key: issue.key,
        appUrl: this.api.appUrl,
        assignee: issue.fields.assignee?.displayName || 'UNASSIGNED',
        summary: issue.fields.summary,
        status: {
          id: issue.fields.status.id,
          name: issue.fields.status.name,
        },
        sprints: sprintId && issue.fields[sprintId] ? issue.fields[sprintId] : [],
      }),
    );
  }

}

export default Issues;