import { github } from '@context';
import useInitPullRequests from './useInitPullRequests';
import useInitRepositories from './useInitRepositories';
import useInitSettings from './useInitSettings';

const useInit: Hooks.UseInit<App.Github.ContextInit> = () => {
  const initPullRequests = useInitPullRequests();
  const initRepositories = useInitRepositories();
  const initSettings = useInitSettings();
  const setDraft = github.useSetDraft();
  const { hasInit } = github.useTrackedState();

  const init = (contextInit: App.Github.ContextInit) => {
    switch (contextInit) {
      case 'pullRequests': {
        if (!hasInit.includes('pullRequests')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'pullRequests'];
          });
          initPullRequests();
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
      case 'repositories': {
        if (!hasInit.includes('repositories')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'repositories'];
          });
          initRepositories();
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
