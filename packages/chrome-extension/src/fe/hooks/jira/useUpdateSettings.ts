import { jira } from '@context';
import { chrome } from '@utils';
import { useCallback } from 'react';

const useUpdateSettings = <T extends keyof Storage.Jira.SettingsStore>(): Hooks.Jira.UseUpdateSettingsDispatch<T> => {
  const setDraft = jira.useSetDraft();

  return useCallback(
    <T extends keyof Storage.Jira.SettingsStore>(key: T, updates: Storage.Jira.SettingsStore[T]) => {
      setDraft((draft) => {
        draft.settings[key] = updates;
        chrome.runtime.send({ type: 'STORAGE_SET', key: 'jiraSettings', data: draft.settings });

      });
    },
    [setDraft],
  );
};

export default useUpdateSettings;
