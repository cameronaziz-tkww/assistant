import { NO_SPRINT } from '@units/jira/constants';
import { capitalize } from '@utils';

const create = (issue: App.Jira.Issue, mapping: App.Filter.CreateMapping): void => {
  const { sprints } = issue;

  if (sprints.length === 0) {
    if (!mapping[NO_SPRINT]) {
      mapping[NO_SPRINT] = {
        id: NO_SPRINT,
        abbreviation: 'NS',
        full: NO_SPRINT,
      };
    }
    return;
  }

  issue.sprints.forEach((sprint) => {
    const full = capitalize(sprint.state);
    if (!mapping[full]) {
      mapping[full] = {
        id: full,
        abbreviation: full[0],
        full,
      };
    }
  });
};

const run = (issue: App.Jira.Issue, full: string): boolean => {
  const { sprints } = issue;
  if (sprints.length === 0 && full === NO_SPRINT) {
    return true;
  }

  return sprints.some((sprint) => {
    const sprintState = capitalize(sprint.state);
    return full === sprintState;
  });
};
export default {
  id: 'jira-sprint',
  label: 'Sprint State',
  run,
  create,
};
