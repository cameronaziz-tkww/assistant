import { github } from '@context';
import { entries } from '@utils';
import useInit from './useInit';

const useSettings = <T extends keyof Storage.Github.SettingsStore>(keys?: T[]): Hooks.Github.UseSettingsDispatch<T> => {
  const { init: initSettings } = useInit();

  const state = github.useTrackedState();
  const { settings: settingsState } = state;

  const init = () => {
    initSettings('settings');
  };

  const settings = entries(settingsState)
    .filter((entry) => {
      if (!entry) {
        return false;
      }
      const [key] = entry;
      return keys ? keys.includes(key as T) : false;
    })
    .reduce(
      (acc, cur) => {
        if (cur) {
          const [key, value] = cur;
          acc[key] = value;
        }
        return acc;
      },
      {} as Pick<Storage.Github.SettingsStore, T>,
    );

  return {
    settings,
    init,
  };
};

export default useSettings;
