import { UNASSIGNED } from '@units/jira/constants';

const create: App.Filter.Create<App.Jira.Issue> = (issue, mapping): void => {
  const full = issue.assignee || UNASSIGNED;
  if (!mapping[full]) {
    mapping[full] = {
      id: full,
      abbreviation: full.split(' ').map((word) => word[0]).join(''),
      full,
    };
  }
};

const run = (issue: App.Jira.Issue, id: string): boolean => {
  const fullName = issue.assignee || UNASSIGNED;
  return fullName === id;
};

export default {
  id: 'jira-assignee',
  label: 'Assignee',
  run,
  create,
};