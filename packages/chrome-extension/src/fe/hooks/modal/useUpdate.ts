import { modal } from '@context';
import { useCallback } from 'react';

const useUpdate: Hooks.UseUpdate = () => {
  const setDraft = modal.useSetDraft();

  const selection = useCallback(
    (selectionId: App.SettingsTab | null) => {
      setDraft(
        (draft) => {
          draft.selection = selectionId;
        });
    },
    [setDraft],
  );

  return {
    selection,
  };
};

export default useUpdate;
