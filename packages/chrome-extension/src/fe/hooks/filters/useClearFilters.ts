import { filters } from '@context';
import { useCallback } from 'react';

const useClearFilters: Hooks.Filters.UseClearFilters = () => {
  const setDraft = filters.useSetDraft();

  const handle = useCallback(
    (groupId: string) => {
      setDraft((draft) => {
        return draft.currentFilters.filter((draftFilter) => draftFilter.groupId !== groupId);
      });
    },
    [setDraft],
  );

  return {
    handle,
  };
};

export default useClearFilters;
