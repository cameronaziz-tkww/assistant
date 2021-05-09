import { NO_SPRINT } from '@units/jira/constants';
import { capitalize } from '@utils';

const create: App.Filter.Create<App.Jira.Issue> = (issue, mapping): void => {
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
        id: sprint.id,
        abbreviation: full[0],
        full,
      };
    }
  });
};

const run = (issue: App.Jira.Issue, id: string): boolean => {
  const { sprints } = issue;
  if (sprints.length === 0 && id === NO_SPRINT) {
    return true;
  }

  return sprints.some((sprint) => {
    const sprintState = capitalize(sprint.state);
    return id === sprintState;
  });
};
export default {
  id: 'jira-sprint',
  label: 'Sprint',
  run,
  create,
};
