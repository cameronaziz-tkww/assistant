import { filters } from '@context';

const useFilterGroupFilters = <T extends App.Filter.Item>(groupId: string): Hooks.Filters.UseFilterGroupFiltersDispatch<T> => {
  const state = filters.useTrackedState();
  const group = state.filterGroups.find((group) => group.id === groupId);

  if (!group) {
    return {
      filters: [],
    };
  }

  const data: App.Filter.FilterWrapper<T>[] = [];

  for (const filter in group.filters) {
    const item = group.filters[filter] as unknown as App.Filter.FilterWrapper<T>;
    data.push(item);
  }

  return {
    filters: data,
  };
};

export default useFilterGroupFilters;
