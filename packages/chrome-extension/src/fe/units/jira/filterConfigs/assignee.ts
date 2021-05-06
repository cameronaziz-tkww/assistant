import { UNASSIGNED } from '@units/jira/constants';

const create = (issue: App.Jira.Issue, mapping: App.Filter.CreateMapping): void => {
  const full = issue.assignee || UNASSIGNED;
  if (!mapping[full]) {
    mapping[full] = {
      id: full,
      abbreviation: full.split(' ').map((word) => word[0]).join(''),
      full,
    };
  }
};

const run = (issue: App.Jira.Issue, full: string): boolean => {
  const fullName = issue.assignee || UNASSIGNED;
  return fullName === full;
};

export default {
  id: 'jira-assignee',
  label: 'Assignee',
  run,
  create,
};