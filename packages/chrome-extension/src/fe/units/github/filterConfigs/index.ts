import { filterBuilder } from '@utils';
import createdBy from './createdBy';
import labels from './labels';
import status from './status';

export const filterConfigs: App.Filter.FilterMapping<App.Github.FilterableKeys> = {
  createdBy,
  status,
  labels,
};

export default filterBuilder.createFilterConfigs(filterConfigs);
