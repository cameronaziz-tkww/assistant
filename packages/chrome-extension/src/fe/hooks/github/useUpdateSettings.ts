import { github } from '@context';
import { chrome } from '@utils';
import { useCallback } from 'react';

const useUpdateSettings = <T extends keyof Storage.Github.SettingsStore>(): Hooks.Github.UseUpdateSettingsDispatch<T> => {
  const setDraft = github.useSetDraft();

  return useCallback(
    <T extends keyof Storage.Github.SettingsStore>(key: T, updates: Storage.Github.SettingsStore[T]) => {
      setDraft((draft) => {
        draft.settings[key] = updates;
        chrome.runtime.send({ type: 'STORAGE_SET', key: 'githubSettings', data: draft.settings });
      });
    },
    [setDraft],
  );
};

export default useUpdateSettings;
