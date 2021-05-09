import { filters } from '@context';
import { Immutable } from 'immer';

interface GetNextResult {
  current: App.Filter.FilterState;
  last: App.Filter.FilterState;
}

const useApplyFilter: Hooks.Filters.UseApplyFilter = () => {
  const setDraft = filters.useSetDraft();
  const state = filters.useTrackedState();

  const has = (filters: App.Filter.AppliedFilter[], state: App.Filter.FilterState) =>
    filters.some((filter) => filter.state === state);

  const getNextStates = (
    currentState: App.Filter.FilterState,
    filterId: string | number,
    group: Immutable<App.Filter.Group<App.Filter.Item>>,
  ): GetNextResult => {

    const allButClicked = group.appliedFilters
      .filter((groupCurrent) => filterId !== groupCurrent.itemId);
    const next = group.lastState === 'include' ? 'exclude' : 'include';

    const allOmit = has(allButClicked, 'omit');
    if (allButClicked.length === 0 || allOmit) {
      switch (currentState) {
        case 'include': {
          return {
            current: 'omit',
            last: 'include',
          };
        }
        case 'exclude': {
          return {
            current: 'omit',
            last: 'exclude',
          };
        }
        case 'omit': {
          return {
            current: next,
            last: 'omit',
          };
        }
      }
    }

    const hasIncludes = has(allButClicked, 'include');
    if (hasIncludes) {
      return {
        current: currentState === 'include' ? 'omit' : 'include',
        last: 'include',
      };
    }

    const hasExclude = has(allButClicked, 'exclude');
    if (hasExclude) {
      return {
        current: currentState === 'exclude' ? 'omit' : 'exclude',
        last: 'exclude',
      };
    }

    return {
      current: next,
      last: next,
    };

  };

  const applyFilter = (groupId: string, filterId: string | number) => {
    const group = state.filterGroups.find((group) => group.id === groupId);
    if (!group) {
      return;
    }

    const currentFilter = group.appliedFilters.find((filter) => filter.itemId === filterId);
    const nextStates = getNextStates(currentFilter?.state || 'omit', filterId, group);

    setDraft(
      (draft) => {
        const index = draft.filterGroups.findIndex((group) => group.id === groupId);
        if (index < 0) {
          return;
        }

        draft.filterGroups[index].lastState = nextStates.last;

        const filterIndex = draft.currentFilters.findIndex((filter) => filter.filter.id === filterId);
        if (filterIndex > -1) {
          draft.currentFilters[filterIndex].state = nextStates.current;
        }

        const appliedFilterIndex = draft.filterGroups[index].appliedFilters.findIndex((filter) => filter.itemId === filterId);
        if (appliedFilterIndex < 0) {
          draft.filterGroups[index].appliedFilters.push({
            itemId: filterId,
            groupId: groupId,
            state: nextStates.current,
          });
          return draft;
        }

        draft.filterGroups[index].appliedFilters[appliedFilterIndex].state = nextStates.current;
        return draft;
      },
    );
  };

  return applyFilter;
};

export default useApplyFilter;
