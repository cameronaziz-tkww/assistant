import { jira } from '@context';
import { entries } from '@utils';

const useSettings = <T extends keyof Storage.Jira.SettingsStore>(keys: T[]): Pick<Storage.Jira.SettingsStore, T> => {
  const { settings } = jira.useTrackedState();

  const data = entries(settings)
    .filter((entry) => {
      if (!entry) {
        return false;
      }
      const [key] = entry;
      return keys.includes(key as T);
    })
    .reduce(
      (acc, cur) => {
        if (cur) {
          const [key, value] = cur;
          acc[key] = value;
        }
        return acc;
      },
      {} as Pick<Storage.Jira.SettingsStore, T>,
    );

  return data;
};

export default useSettings;
