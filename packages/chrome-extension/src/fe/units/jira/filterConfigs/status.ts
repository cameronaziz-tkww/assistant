import { baseColorsBase } from '@utils';

const setColors = {
  '10824': baseColorsBase['green'], // Verified on QA
  '10820': baseColorsBase['green'], // Ready for Deployment
  '3': baseColorsBase['green'], // In Progress
  '10203': baseColorsBase['yellow'], // Code Review
  '10823': baseColorsBase['grey-light'], // Unprioritized
  '10010': baseColorsBase['grey-light'], // To Do
  '10825': baseColorsBase['yellow'], // Ready for QA
  '10817': baseColorsBase['red'], // Rejected
  '10205': baseColorsBase['red'], // In QA
  '10009': baseColorsBase['green'], // Done
};

const create: App.Filter.Create<App.Jira.Issue> = (issue, mapping): void => {
  const { id, name } = issue.status;
  if (!mapping[id]) {
    mapping[id] = {
      id,
      abbreviation: name.split(' ').map((word) => word[0]).join(''),
      full: name,
      color: setColors[id],
    };
  }
};

const run = (issue: App.Jira.Issue, id: string): boolean => issue.status.id === id;

export default {
  id: 'jira-status',
  label: 'Status',
  run,
  create,
};