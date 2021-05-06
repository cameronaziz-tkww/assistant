import { honeybadger } from '@context';
import useInitFaults from './useInitFaults';
import useInitProjects from './useInitProjects';
import useInitSettings from './useInitSettings';

const useInit: Hooks.UseInit<App.Honeybadger.ContextInit> = () => {
  const initFaults = useInitFaults();
  const initSettings = useInitSettings();
  const initProjects = useInitProjects();
  const setDraft = honeybadger.useSetDraft();
  const { hasInit } = honeybadger.useTrackedState();

  const init = (contextInit: App.Honeybadger.ContextInit) => {
    switch (contextInit) {
      case 'faults': {
        if (!hasInit.includes('faults')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'faults'];
          });
          initFaults();
          return true;
        }
        return false;
      }
      case 'settings': {
        if (!hasInit.includes('settings')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'settings'];
          });
          initSettings();
          return true;
        }
        return false;
      }
      case 'projects': {
        if (!hasInit.includes('projects')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'projects'];
          });
          initProjects();
          return true;
        }
        return false;
      }
      default: throw new Error('Bad Unit');
    }
  };

  return {
    init,
    hasInit,
  };
};

export default useInit;
