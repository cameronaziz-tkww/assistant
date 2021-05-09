import { useFiltersSelector, useFiltersState } from '@context/filters';

const useAppliedFilters = <T extends App.Filter.Item>(): Hooks.Filters.UseAppliedFiltersDispatch<T> => {
  const { filterConfigs } = useFiltersState();
  const appliedFilters = useFiltersSelector((state) => state.filterGroups.flatMap((group) => group.appliedFilters));

  const appliedFiltersByGroup = appliedFilters.reduce(
    (acc, cur) => {
      const current = acc[cur.groupId];
      if (!current) {
        const config = filterConfigs.find((filter) => filter.id === cur.groupId);
        if (!config) {
          return acc;
        }

        acc[cur.groupId] = {
          state: cur.state,
          applied: [],
          config,
          groupId: cur.groupId,
        };
      }
      acc[cur.groupId].applied.push(cur);
      return acc;
    },
    {} as Hooks.Filters.ByGroup<T>,
  );

  return {
    configs: filterConfigs,
    appliedFilters,
    appliedFiltersByGroup,
  };
};

export default useAppliedFilters;
