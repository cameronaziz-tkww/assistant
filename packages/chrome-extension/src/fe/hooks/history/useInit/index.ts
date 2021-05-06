import { history } from '@context';
import useInitFeed from './useInitFeed';

const useInit: Hooks.UseInit<App.History.ContextInit> = () => {
  const initFeed = useInitFeed();
  const setDraft = history.useSetDraft();
  const { hasInit } = history.useTrackedState();

  const init = (contextInit: App.History.ContextInit) => {
    switch (contextInit) {
      case 'feed': {
        if (!hasInit.includes('feed')) {
          setDraft((draft) => {
            draft.hasInit = [...draft.hasInit, 'feed'];
          });
          initFeed();
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
