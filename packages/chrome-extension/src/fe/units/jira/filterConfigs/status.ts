import { baseColorsBase } from '@utils';

const setColors = {
  'In Progress': baseColorsBase['green'],
  'In Code Review': baseColorsBase['yellow'],
  'In QA': baseColorsBase['red'],
  'Rejected': baseColorsBase['red'],
  'Ready for Deployment': baseColorsBase['yellow'],
  'Unprioritized': baseColorsBase['grey-light'],
  'Verified on QA': baseColorsBase['green'],
  'Done': baseColorsBase['green'],
};

const create = (issue: App.Jira.Issue, mapping: App.Filter.CreateMapping): void => {
  const { id, name } = issue.status;
  if (!mapping[id]) {
    mapping[id] = {
      id: name,
      abbreviation: name.split(' ').map((word) => word[0]).join(''),
      full: name,
      color: setColors[name],
    };
  }
};

const run = (issue: App.Jira.Issue, full: string): boolean => {
  const { name } = issue.status;
  return name === full;
};

export default {
  id: 'jira-status',
  label: 'Status',
  run,
  create,
};