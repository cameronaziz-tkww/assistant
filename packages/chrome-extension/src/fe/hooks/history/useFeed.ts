import { history } from '@context';
import { useUnits } from '../global';
import useInit from './useInit';

const useFeed: Hooks.History.UseFeed = () => {
  const state = history.useTrackedState();
  const { init: initFeed } = useInit();
  const { visibleUnits } = useUnits();

  const init = () => {
    initFeed('feed');
  };

  const feed = state.feed
    .filter(
      (feedItem) => {
        if (feedItem.app === 'github' && visibleUnits.includes('github')) {
          return true;
        }
        if (feedItem.app === 'jira' && visibleUnits.includes('jira')) {
          return true;
        }
        return false;
      },
    );

  return {
    feed,
    init,
  };
};

export default useFeed;
