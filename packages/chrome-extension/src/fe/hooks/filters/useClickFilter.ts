import filters, { FiltersContextValue } from '@context/filters';
import { useCallback } from 'react';

interface FilterPredicate<T extends App.Filter.Item> {
  config: App.Filter.FilterGroupConfig<T> | undefined;
  filter: App.Filter.FilterItem<T>;
}

const useClickFilter = <T extends App.Filter.Item>(): Hooks.Filters.UseClickFilterDispatch<T> => {
  const setDraft = filters.useSetDraft();
  const has = (group: FilterPredicate<T>[], state: App.Filter.FilterState) => group.some((item) => item.filter.state === state);

  const filterItems = <U extends App.Filter.Item>(draft: FiltersContextValue<U>): U[] => {
    const { currentFilters, allItems } = draft;

    if (currentFilters.length === 0) {
      return allItems;
    }

    const currentFilterState = currentFilters
      .map((filter) => ({
        config: draft.filterConfigs.find((config) => config.id === filter.groupId),
        filter,
      }));

    if (currentFilterState.length === 0 || currentFilterState.every((state) => state.filter.state === 'omit')) {
      return allItems;
    }

    const groups = currentFilterState.reduce(
      (acc, cur) => {
        const found = acc.findIndex((state) => state.findIndex((item) => item.filter.groupId === cur.filter.groupId) > -1);
        if (found > -1) {
          acc[found].push(cur);
          return acc;
        }
        acc.push([cur]);
        return acc;
      },
      [] as FilterPredicate<T>[][],
    );

    return allItems.filter(
      (item, index) => {
        const predicate = (state: FilterPredicate<T>, hasIncludes: boolean, hasIgnore: boolean): boolean => {
          const match = !!state.config?.run(item, state.filter.filter.full, index);
          if (match === true) {
            if (state.filter.state === 'include') {
              return true;
            }

            if (state.filter.state === 'exclude') {
              return false;
            }
          }

          if (state.filter.state === 'include') {
            return false;
          }

          if (state.filter.state === 'exclude') {
            return true;
          }

          if (state.filter.state === 'omit') {
            if (hasIncludes) {
              return false;
            }
            if (hasIgnore) {
              return true;
            }
          }
          return true;
        };

        return groups.every((group) => {
          const hasIncludes = has(group, 'include');
          const hasIgnore = has(group, 'exclude');
          if (hasIncludes) {
            return group.some((item) => predicate(item, hasIncludes, hasIgnore));
          }
          if (hasIgnore) {
            return group.every((item) => predicate(item, hasIncludes, hasIgnore));
          }
          return true;

        });

      },
    );
  };

  const nextFromOmit = (lastState: App.Filter.FilterState): App.Filter.FilterState => {
    switch (lastState) {
      case 'exclude': return 'include';
      case 'include': return 'exclude';
      case 'omit': return 'include';
      default: return 'include';
    }
  };

  const next = (lastState: App.Filter.FilterState, allowable: App.Filter.FilterState): App.Filter.FilterState => {
    switch (lastState) {
      case 'exclude': return 'omit';
      case 'include': return 'omit';
      case 'omit': return allowable;
      default: return allowable;
    }
  };

  const handle = useCallback(
    (clickedFilter: App.Filter.FilterItem<T>) => {
      const { filter: { id: filterId }, groupId, state: clickedFilterState } = clickedFilter;

      setDraft((draft) => {
        const { currentFilters, filterGroups } = draft;
        const currentFilter = currentFilters.find((draftCurrent) => filterId === draftCurrent.filter.id && groupId === draftCurrent.groupId);

        if (!currentFilter) {
          return;
        }

        const group = filterGroups.find((filterGroup) => filterGroup.id === groupId) || {} as App.Filter.CurrentFilterGroup<T>;

        const currentFiltersInGroup = currentFilters
          .filter((draftCurrent) => groupId === draftCurrent.groupId);

        const allButClicked = currentFiltersInGroup
          .filter((draftCurrent) => filterId !== draftCurrent.filter.id);

        if (currentFiltersInGroup.every((filter) => filter.state === 'omit')) {
          const state = nextFromOmit(group.lastState);
          currentFilter.state = state;
          group.lastState = state;
          return draft;
        }

        const has = (filters: App.Filter.FilterItem<App.Filter.Item>[], state: App.Filter.FilterState) =>
          filters.some((filter) => filter.state === state);

        const hasIncludes = has(allButClicked, 'include');
        if (hasIncludes || group.lastState === 'omit') {
          if (currentFilter.state === 'include') {
            currentFilter.state = 'omit';
            return draft;
          }
          const state = next(clickedFilterState, 'include');
          currentFilter.state = state;
          group.lastState = state;
          return draft;
          // draft.filteredItems = filterItems(draft as unknown as FiltersContextValue<App.Filter.Item>);
        }

        const hasExclude = has(allButClicked, 'exclude');
        if (hasExclude || group.lastState === 'include') {
          if (currentFilter.state === 'exclude') {
            currentFilter.state = 'omit';
            return draft;
          }
          const state = next(clickedFilterState, 'exclude');
          currentFilter.state = state;
          group.lastState = state;
          return draft;
          // draft.filteredItems = filterItems(draft as unknown as FiltersContextValue<App.Filter.Item>);
        }

        currentFilter.state = 'omit';
        group.lastState = 'exclude';

        return draft;
      });

      setDraft(
        (draft) => {
          draft.filteredItems = filterItems(draft as unknown as FiltersContextValue<App.Filter.Item>);
        },
      );

    },
    [setDraft],
  );

  return {
    handle,
  };
};

export default useClickFilter;
