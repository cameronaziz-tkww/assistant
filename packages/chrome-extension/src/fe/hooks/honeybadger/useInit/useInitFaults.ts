import { honeybadger } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const useInitFaults: Hooks.UseInitContext = () => {
  const setDraft = honeybadger.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.Honeybadger.RecentNewNoticesResponse) => {
    if (message.meta.done) {
      setIsFetching(false);
    }

    setDraft(() => {
      // draft.pullRequests = message.data;
      // draft.prConfig = getPullRequestConfig(message.data);
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('honeybadger/RECENT_NEW_NOTICES_RESPONSE', listener);
    if (!isFetching) {
      setIsFetching(true);
      chrome.runtime.send({ type: 'honeybadger/RECENT_NEW_NOTICES_FETCH' });
    }
    return hangup;
  };

  return init;
};

export default useInitFaults;
