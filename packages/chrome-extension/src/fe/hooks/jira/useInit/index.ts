import { jira } from '@context';
import useInitIssues from './useInitIssues';
import useInitProjects from './useInitProjects';
import useInitSettings from './useInitSettings';

const useInit: Hooks.UseInit<App.Jira.ContextInit> = () => {
  const initIssues = useInitIssues();
  const initProjects = useInitProjects();
  const initSettings = useInitSettings();
  const setDraft = jira.useSetDraft();
  const { hasInit } = jira.useTrackedState();

  const init = (contextInit: App.Jira.ContextInit) => {
    if (hasInit.includes(contextInit)) {
      return false;
    }

    setDraft((draft) => {
      draft.hasInit = [...draft.hasInit, contextInit];
    });

    switch (contextInit) {
      case 'issues': {
        if (!hasInit.includes('issues')) {
          initIssues();
          return true;
        }
        return false;
      }
      case 'settings': {
        if (!hasInit.includes('settings')) {
          initSettings();
          return true;
        }
        return false;
      }
      case 'projects': {
        if (!hasInit.includes('projects')) {
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
