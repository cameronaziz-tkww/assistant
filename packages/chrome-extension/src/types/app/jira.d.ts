declare namespace App {
  namespace Jira {

    type Reactors = 'watched-updated';
    type ContextInit = 'settings' | 'issues' | 'projects';

    interface Metadata {
      boards: SimpleBoard[];
      // meta: Meta[]
      // sprints: Sprint[];
    }

    type IssueStatus = string;

    interface ProjectFilters {
      onlyActive?: boolean;
      onlyAssigned?: boolean;
    }

    type WatchedProject = {
      statuses: IssueStatus[];
      filters: ProjectFilters;
    }

    type Watched = {
      [projectId: string]: WatchedProject
    }

    type AuthStatus = 'waiting' | 'is' | 'not';

    interface Project {
      id: string;
      key: string;
      name: string;
      avatarUrl: string;
      expand: string;
      statuses: Status[];
    }

    interface Status {
      issueType: string;
      description: string;
      iconUrl: string;
      name: string;
      id: string;
    }

    interface Meta {
      id: string;
      name: string;
      projectKey: string;
      projectId: string;
      issueTypes: IssueType[];
    }

    interface AvatarUrls {
      '16x16': string;
      '24x24': string;
      '32x32': string;
      '48x48': string;
    }

    interface Board {
      id: number;
      location: Location
      name: string;
      type: string;
    }

    interface SimpleBoard {
      id: number;
      name: string;
      noSprints: boolean | 'UNKNOWN';
      sprints: SimpleSprint[];
      projectKey: string;
      projectId: number;
      issueTypes: IssueType[];
      followFuture: boolean;
      followCurrent: boolean;
    }

    interface SimpleSprint {
      state: SprintState;
      id: number;
      name: string;
      projectKey: string;
      projectId: number;
      boardId: number;

    }

    interface IssueType {
      avatarId: number;
      description: string;
      iconUrl: string;
      id: string;
      name: string;
      self: string;
      subtask: boolean;
      untranslatedName: string;
    }

    type SprintState = 'closed' | 'active' | 'future';

    interface Sprint {
      endDate: string;
      goal: string;
      id: number;
      name: string;
      originBoardId: number;
      self: string;
      startDate?: string;
      state: SprintState;
    }

    type Selection = 'main' | 'auth';

    interface SimpleStatus {
      id: string;
      name: string;
    }

    type FilterableKeys = keyof Required<IssueFilterable>;

    interface IssueFilterable {
      assignee?: string;
      status: SimpleStatus;
      sprints: Sprint[];
    }

    interface Sprint {
      boardId: number;
      id: number;
      name: string;
      state: string;
    }

    interface Issue extends IssueFilterable {
      id: string;
      key: string;
      summary: string;
      createdAt: string;
      projectKey: string;
      projectId: string;
      appUrl: string;
    }
  }
}
