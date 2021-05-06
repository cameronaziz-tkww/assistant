import { filters } from '@context';

const useFilterGroupFilters = <T extends App.Filter.Item>(groupId: string): Hooks.Filters.UseFilterGroupFiltersDispatch<T> => {
  const state = filters.useTrackedState();
  const group = state.filterGroups.find((group) => group.id === groupId);

  if (!group) {
    return {
      filters: [],
    };
  }

  const data: App.Filter.FilterItem<T>[] = [];
  for (const filter in group.filters) {
    data.push(group.filters[filter]);
  }

  return {
    filters: data,
  };
};

export default useFilterGroupFilters;
