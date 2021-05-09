declare namespace API {
  namespace Jira {
    interface API {
      cloudId: string;
      token: string;
      appUrl: string;
    }

    interface PaginationResponse<T> {
      maxResults: number;
      self: string;
      next: string;
      startAt: number;
      total: number;
      isLast: boolean;
      values: T[]
    }

    interface SimpleStats {
      maxResults: number;
      startAt: number;
      total: number;
    }

    type KeyItems<T extends string, U> = {
      [key in T]: U[];
    }

    interface AvatarUrls {
      '48x48': string;
      '24x24': string;
      '16x16': string;
      '32x32': string;
    }

    interface ProjectCategory {
      self: string;
      id: string;
      name: string;
      description: string;
    }

    interface Status {
      self: string;
      description: string;
      iconUrl: string;
      name: string;
      id: string;
    }

    interface StatusResponse {
      self: string;
      id: string;
      name: string;
      subtask: boolean;
      statuses: Status[];
    }

    interface CustomFieldSchema {
      custom: string;
      customId: number;
      items: string;
      type: string;
    }

    interface CustomField {
      clauseNames: string[];
      custom: boolean;
      id: string;
      key: string;
      name: string
      navigable: boolean;
      orderable: boolean;
      schema: CustomFieldSchema;
      scope?: {
        project: {
          id: stirng
        }
        type: string
      }
      searchable: boolean
      untranslatedName: string
    }

    interface Project {
      avatarUrls: AvatarUrls;
      expand: string;
      isPrivate: boolean;
      id: string;
      key: string;
      name: string;
      projectCategory: ProjectCategory;
      projectTypeKey: string;
      self: string;
      simplified: boolean;
      style: string;
    }

    interface Apps {
      issues: Issue[]
      projects: Project[]
      statuses: StatusResponse[]
    }

    type SuccessResponse<T extends string, U, V = void, W = void> = V & {
      [key in T]: (U & W)[];
    }
    interface SuccessMeta {
      expand: string;
      startAt: number;
      maxResults: number;
      total: number;
    }

    interface Board {
      id: number;
      location: Location
      name: string;
      self: string;
      type: string;
    }

    interface Location {
      avatarURI: string;
      displayName: string;
      name: string;
      projectId: number;
      projectKey: string;
      projectName: string;
      projectTypeKey: string;
    }

    type Excess = {
      isLast: boolean;
      maxResults: number;
      startAt: number;
      total: number;
    }

    interface Meta {
      avatarUrls: AvatarUrls;
      id: string;
      issueTypes: IssueTypeMeta[];
      key: string;
      name: string;
      self: string;
    }

    type Result<T, U = 'values'> = {
      [key in U]: T;
    }

    interface ErrorResponse {
      errorMessages: string[]
      errors: App.ShouldDefineType
    }

    type Response<T extends string, U, V = void, W = void> = ErrorResponse | SuccessResponse<T, U, V, W>;

    interface IssueTypeBase {
      avatarId: number;
      description: string;
      iconUrl: string;
      id: string;
      name: string;
      self: string;
      subtask: boolean;
    }

    interface FieldsIssueType extends IssueTypeBase {
      avatarId: number;
    }

    interface IssueTypeMeta extends IssueTypeBase {
      untranslatedName: string;
    }

    interface Priority {
      self: string;
      iconUrl: string;
      name: string;
      id: string;
    }

    interface AvatarUrls {
      '16x16': string;
      '24x24': string;
      '32x32': string;
      '48x48': string;
    }

    interface User {
      accountId: string;
      accountType: string;
      active: boolean;
      avatarUrls: AvatarUrls;
      displayName: string;
      emailAddress: string;
      self: string;
      timeZone: string;
    }

    interface StatusCategory {
      colorName: string;
      id: number;
      key: string;
      name: string;
      self: string;
    }

    interface Status {
      description: string;
      iconUrl: string;
      id: string;
      name: string;
      self: string;
      statusCategory: StatusCategory;
    }

    type DescriptionContent = DescriptionParagraph | DescriptionCodeBlock;

    interface DescriptionParagraph {
      type: 'paragraph';
      content: DescriptionText[];
    }
    interface DescriptionCodeBlock {
      type: 'codeBlock';
      attrs: Record<string, unknown>;
      content: DescriptionText[];
    }

    interface DescriptionText {
      type: 'text';
      text: string;
    }

    interface Description {
      type: 'doc';
      version: number;
      content: DescriptionContent[]
    }

    interface Fields {
      ggregateprogress: {
        progress: number;
        total: number;
      }
      aggregatetimeestimate: App.ShouldDefineType;
      aggregatetimeoriginalestimate: App.ShouldDefineType;
      aggregatetimespent: App.ShouldDefineType;
      assignee?: User
      components: App.ShouldDefineType[];
      created: string;
      creator: User;
      description: Description;
      duedate: App.ShouldDefineType;
      environment: App.ShouldDefineType;
      fixVersions: App.ShouldDefineType[];
      issuelinks: App.ShouldDefineType[];
      issuetype: FieldsIssueType;
      labels: App.ShouldDefineType[];
      lastViewed: string;
      priority: Priority
      progress: {
        progress: number;
        total: number;
      }
      project: Project;
      reporter: User
      resolution: App.ShouldDefineType;
      resolutiondate: App.ShouldDefineType;
      security: App.ShouldDefineType;
      status: Status;
      statuscategorychangedate: string;
      subtasks: App.ShouldDefineType[];
      summary: string;
      timeestimate: App.ShouldDefineType;
      timeoriginalestimate: App.ShouldDefineType;
      timespent: App.ShouldDefineType;
      updated: string;
      votes: {
        self: string;
        votes: number;
        hasVoted: boolean;
      }
      watches: {
        self: string;
        watchCount: number;
        isWatching: boolean;
      }
      workratio: number;
    }

    interface Author {
      accountId: string;
      accountType: string;
      active: boolean;
      displayName: string;
      emailAddress: string;
      self: string;
      timeZone: string;
      avatarUrls: AvatarUrls;
    }

    interface Item {
      field: string;
      fieldId: string;
      fieldtype: string;
      from: string;
      fromString: string;
      tmpFromAccountId: string;
      tmpToAccountId: string;
      to: string;
      toString: string;
    }

    interface Histories {
      author: Author;
      created: string;
      id: string;
      items: Item[]
    }

    interface ChangeLogBase {
      histories: Histories[]
    }

    interface ChangeLog {
      changelog: KeyItems<'histories', Histories> & SimpleStats
    }

    interface Change extends Omit<Relevant, 'items'> {
      item: Item
    }

    interface Relevant extends Histories {
      issue: Issue
    }

    type Issue = {
      expand: string;
      fields: Fields;
      id: string;
      key: string;
      self: string;
      [key: `customfield_${string}`]: App.ShouldDefineType;
    }
  }
}