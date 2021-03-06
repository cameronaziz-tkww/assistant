import type { FiltersContextProviderProps, FiltersContextValue } from '../../fe/context/filters/index';
import applyFilter from './applyFilter';
import groups from './groups';

const parseProps = <T extends App.Filter.Item>(props: FiltersContextProviderProps<T>, state: FiltersContextValue<T>): FiltersContextValue<T> => {
  const { items, filterConfigs } = props;
  const filterGroups = groups(filterConfigs, items);
  const currentFilters = filterGroups.reduce(
    (acc, cur) => {
      const group = Object.values(cur.filters);
      acc.push(...group);
      return acc;
    },
    [] as App.Filter.FilterWrapper<T>[],
  );

  return {
    ...state,
    currentFilters,
    filterGroups,
    filterConfigs,
    allItems: items,
    filteredItems: items,
  };
};

const createFilterConfigs = <T extends string, U extends App.Filter.Item>(filterConfigs: App.Filter.FilterMapping<T>) =>
  (filters: T[]): App.Filter.GroupConfig<U>[] =>
    filters ? filters.map((filter) => filterConfigs[filter]) : [];

export default {
  parseProps,
  createFilterConfigs,
  applyFilter,
};