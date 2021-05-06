
export const defaultFilters: Storage.Jira.SettingsStore['filters'] = [
  'assignee',
  'status',
];

export const defaultHideStatuses: Storage.Jira.SettingsStore['hideStatuses'] = {
  done: true,
  unprioritized: false,
};

export const defaultSettings: Storage.Jira.SettingsStore = {
  hideStatuses: defaultHideStatuses,
  filters: defaultFilters,
};
