import { filters } from '@context';

const useFilterGroups = <T extends App.Filter.Item>(): Hooks.Filters.UseFilterGroupsDispatch<T> => {
  const state = filters.useTrackedState();

  return {
    groups: state.filterGroups,
  };
};

export default useFilterGroups;
