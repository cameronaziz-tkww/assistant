import { history } from '@context';
import useInit from './useInit';

const useFeed: Hooks.History.UseFeed = () => {
  const { feed } = history.useTrackedState();
  const { init: initFeed } = useInit();

  const init = () => {
    initFeed('feed');
  };

  return {
    feed,
    init,
  };
};

export default useFeed;
