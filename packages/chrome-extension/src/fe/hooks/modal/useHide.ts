
import { modal } from '@context';
import { useCallback } from 'react';

const useHide: Hooks.UseHide = () => {
  const setDraft = modal.useSetDraft();

  const units = useCallback(
    (units: App.Unit[]) => {
      setDraft(
        (draft) => {
          draft.hiddenUnits = units;
        });
    },
    [setDraft],
  );

  return {
    units,
  };
};

export default useHide;
