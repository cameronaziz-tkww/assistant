import { gmail, googleCalendar, googleMeet, honeyBadger, jenkins, newRelic, speedCurve } from '@assets';
const githubAuth: Storage.Github.AuthStore = {};

const githubPullRequests: Required<Storage.Github.PullRequests> = {
  pullRequests: [],
};

const githubRepositories: Required<Storage.Github.GithubRepositories> = {
  repositories: [],
  watchedList: [],
};

const githubSettings: Required<Storage.Github.SettingsStore> = {
  reviewsRequired: 2,
  filters: [
    'createdBy',
    'status',
    'labels',
  ],
};

const jiraAuth: Storage.Jira.AuthStore = {};
const honeybadgerAuth: Storage.Honeybadger.AuthStore = {};
const honeybadgerSettings: Storage.Honeybadger.SettingsStore = {
  monitors: [],
};

const jiraIssues: Required<Storage.Jira.Issues> = {
  issues: [],
};

const jiraMeta: Required<Storage.Jira.Meta> = {
  boards: [],
  meta: [],
};

const jiraSettings: Storage.Jira.SettingsStore = {
  hideStatuses: {
    done: true,
    unprioritized: false,
  },
  filters: [
    'assignee',
    'status',
    'sprints',
  ],
};

const linksStandard: Required<App.Links.StandardConfig[]> = [
  {
    id: 'google-calendar',
    title: 'Google Calendar',
    label: 'GC',
    svg: googleCalendar,
    enabled: true,
    buttonChoice: 'icon',
    path: [],
  },
  {
    label: 'GM',
    id: 'google-meet',
    svg: googleMeet,
    title: 'Google Meet',
    enabled: false,
    buttonChoice: 'icon',
    path: [],
  },
  {
    label: 'NR',
    title: 'New Relic',
    id: 'new-relic',
    svg: newRelic,
    enabled: false,
    buttonChoice: 'icon',
    path: [],
  },
  {
    label: 'SC',
    svg: speedCurve,
    id: 'speed-curve',
    title: 'Speed Curve',
    enabled: false,
    buttonChoice: 'icon',
    path: [],
  },
  {
    label: 'HB',
    svg: honeyBadger,
    id: 'honey-badger',
    title: 'HoneyBadger',
    enabled: false,
    buttonChoice: 'icon',
    path: [],
  },
  {
    id: 'gmail',
    svg: gmail,
    label: 'G',
    enabled: true,
    buttonChoice: 'icon',
    title: 'GMail',
    path: [],
  },
  {
    id: 'jenkins',
    svg: jenkins,
    label: 'J',
    title: 'Jenkins',
    enabled: true,
    buttonChoice: 'icon',
    path: [],
  },
];

const linksCustom: App.Links.CustomConfig[] = [];

const githubOrganizations: Storage.Github.Organizations = {
  organizations: [],
};

const jiraProjects: Storage.Jira.Projects = {
  projects: [],
  watched: {},
};

const filters: Storage.Global.FilterSettings = {
  rememberSelections: false,
  storedFilters: [],
};

const visibleUnits: App.VisibleUnit[] = [
  'github',
  'jira',
];

const honeybadgerProjects: App.Honeybadger.Project[] = [];
const historyFeed: Storage.History.HistoryFeed = {
  feed: [],
};

const defaultStorage: Storage.All = {
  linksCustom,
  historyFeed,
  honeybadgerProjects,
  honeybadgerSettings,
  visibleUnits,
  filters,
  honeybadgerAuth,
  linksOrder: [],
  githubAuth,
  linksStandard,
  githubOrganizations,
  githubPullRequests,
  githubRepositories,
  githubSettings,
  jiraAuth,
  jiraProjects,
  jiraIssues,
  jiraMeta,
  jiraSettings,
};

export default defaultStorage;
