import { filterBuilder } from '@utils';
import assignee from './assignee';
import sprints from './sprint';
import status from './status';

export const filterConfigs: App.Filter.FilterMapping<App.Jira.FilterableKeys> = {
  status,
  sprints,
  assignee,
};

export default filterBuilder.createFilterConfigs(filterConfigs);