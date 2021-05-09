
const applyFilter = <T extends App.Filter.Item>(
  items: T[],
  appliedFilterGroups: Hooks.Filters.ByGroup<T>,
): T[] => {
  const appliedFilters = Object.values(appliedFilterGroups);

  if (appliedFilters.length === 0) {
    return items;
  }

  return items.filter((item) =>
    appliedFilters.every((appliedFilter) => {
      if (appliedFilter.state === 'include') {
        return appliedFilter.applied.some((applied) => appliedFilter.config.run(item, applied.itemId));
      }

      if (appliedFilter.state === 'exclude') {
        return !appliedFilter.applied.every((applied) => appliedFilter.config.run(item, applied.itemId));
      }

      return true;
    }),
  );
};
export default applyFilter;
