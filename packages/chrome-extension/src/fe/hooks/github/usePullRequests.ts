import { github } from '@context';
import useInit from './useInit';

const usePullRequests: Hooks.Github.UsePullRequests = () => {
  const trackedState = github.useTrackedState();
  const { init } = useInit();

  const initPullRequests = () => {
    init('pullRequests');
  };

  return {
    pullRequests: trackedState.pullRequests,
    init: initPullRequests,
  };
};

export default usePullRequests;
