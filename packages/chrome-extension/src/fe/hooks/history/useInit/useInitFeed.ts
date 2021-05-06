import { history } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const useInitFeed: Hooks.UseInitContext = () => {
  const setDraft = history.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.History.FeedResponse) => {
    if (message.meta.done) {
      setIsFetching(false);
    }
    setDraft((draft) => {
      draft.feed = message.data;
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('history/FEED_RESPONSE', listener);
    if (!isFetching) {
      setIsFetching(true);
      chrome.runtime.send({ type: 'history/FEED_FETCH' });
    }
    return hangup;
  };

  return init;
};

export default useInitFeed;
