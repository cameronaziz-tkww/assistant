import { from, Reactor, secondsAgo } from '@utils';
import { runtime } from '@utils/chrome';
import type { JiraAPI } from '../api';
import Service from '../base/service';
import type Storage from '../storage';

const LOCAL_TIME = 3600;
const REMOTE_TIME = LOCAL_TIME * 5;

const delayTimes = {
  LOCAL_TIME,
  REMOTE_TIME,
};

class Projects extends Service {
  private projectsInstance: App.Jira.Project[];
  private reactor: Reactor<App.Jira.Reactors>;
  private watchedInstance: App.Jira.Watched;

  constructor(api: JiraAPI, reactor: Reactor<App.Jira.Reactors>, storage: Storage) {
    super(api, storage, delayTimes);

    this.reactor = reactor;
    this.projectsInstance = [];
    this.watchedInstance = {};
    this.fetchWatched();
  }

  get projects(): App.Jira.Project[] {
    return this.projectsInstance
      .sort(
        (a, b) => {
          const aName = a.name.toUpperCase();
          const bName = b.name.toUpperCase();
          if (aName > bName) {
            return 1;
          }

          if (aName < bName) {
            return -1;
          }
          return 0;
        },
      )
      .filter((value, index, self) => from.findIndex(self, (item) => item.id === value.id, index + 1) < 0);
  }

  get watched(): App.Jira.Watched {
    return this.watchedInstance;
  }

  get projectsResponseData(): Runtime.Jira.ProjectsResponseData {
    return {
      projects: this.projects,
      watched: this.watched,
    };
  }

  private fetchWatched = async () => {
    const local = await this.storage.readProperty('jiraProjects');
    if (local) {
      this.watchedInstance = local.watched;
      this.projectsInstance = local.projects;
    }
    this.reactor.dispatchEvent('watched-updated', []);
  }

  write = async (message: Runtime.Jira.ProjectsUpdateWatched): Promise<void> => {
    const { projectId, id, idIsStatus, nextInclude, meta } = message;

    const current = this.watched[projectId];
    if (!current) {
      this.watched[projectId] = {
        filters: {},
        statuses: [],
      };
    }

    if (!idIsStatus) {
      this.watched[projectId].filters[id] = nextInclude;
      this.save(meta.id);
      this.send(meta.id, true);
      return;
    }

    const notPresent = current.statuses.findIndex((status) => status === id) < 0;

    if (nextInclude && notPresent) {
      this.watched[projectId].statuses.push(id);
      this.save(meta.id);
      this.send(meta.id, true);
      return;
    }

    if (!nextInclude) {
      const { statuses, filters } = this.watched[projectId];
      this.watched[projectId] = {
        filters,
        statuses: statuses.filter((status) => status !== id),
      };
    }

    this.save(meta.id);
    this.send(meta.id, true);
  };

  fetchAll = async (message: Runtime.Jira.ProjectsFetch): Promise<void> => {
    const { id } = message.meta;
    const needsLocal = secondsAgo(LOCAL_TIME) > this.lastLocal;
    const needsRemote = secondsAgo(REMOTE_TIME) > this.lastRemote;
    this.stateFetch(id, !needsLocal && !needsLocal);

    if (needsLocal || this.isNewTab) {
      await this.localFetch(id, !needsRemote);
    }

    if (needsRemote) {
      this.remoteFetch(id, true);
    }
  };

  private send = (id: string, done: boolean): void => {
    runtime.respond({
      type: 'jira/PROJECTS_RESPONSE',
      data: this.projectsResponseData,
      meta: {
        done,
        id,
      },
    });
  }

  private save = (id: string): void => {
    this.storage.setProperty({
      key: 'jiraProjects',
      data: {
        projects: this.projects,
        watched: this.watched,
      },
      meta: {
        id,
      },
    });
  }

  fetchStatuses = async (message: Runtime.Jira.StatusesFetch): Promise<void> => {
    const { meta: { id }, projectKey } = message;
    const response = await this.api.fetchStatuses(projectKey);
    const project = this.projectsInstance.find((p) => p.id === projectKey);
    if (project) {
      const statuses = response.reduce(
        (acc, cur) => {
          const children = cur.statuses.reduce(
            (childrenAcc, childrenCur) => {
              const next: App.Jira.Status = {
                ...childrenCur,
                issueType: cur.name,
              };
              childrenAcc.push(next);
              return childrenAcc;
            },
            [] as App.Jira.Status[],
          );

          acc.push(...children);
          return acc;
        },
        [] as App.Jira.Status[],
      );
      statuses.sort(
        (a, b) => {
          const aName = a.name.toUpperCase();
          const bName = b.name.toUpperCase();
          if (aName > bName) {
            return 1;
          }

          if (aName < bName) {
            return -1;
          }
          return 0;
        },
      );
      project.statuses = statuses;
      this.send(id, true);
    }
  };

  private stateFetch = async (id: string, done: boolean): Promise<void> => {
    if (this.projects.length > 0) {
      this.send(id, done);
    }
  };

  private localFetch = async (id: string, done: boolean): Promise<void> => {
    this.lastLocal = new Date().getTime();
    const local = await this.storage.readProperty('jiraProjects');
    if (local?.projects) {
      const { projects } = local;

      if (projects.length > 0) {
        this.projectsInstance = projects;
        this.send(id, done);
      }
    }
  };

  remoteFetch = async (id: string, done: boolean): Promise<void> => {
    if (this.isRunning) {
      this.send(id, done);
      return;
    }

    const nextProjects = await this.api.fetchProjects();
    this.isRunning = true;
    this.projectsInstance = Projects.cleanResponse(nextProjects);
    this.send(id, done);
    this.save(id);
    this.isRunning = false;
  }

  private static cleanResponse = (projects: API.Jira.Project[]): App.Jira.Project[] =>
    projects.map(
      (project) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        avatarUrl: project.avatarUrls['48x48'],
        expand: project.expand,
        statuses: [],
      }),
    );

}

export default Projects;