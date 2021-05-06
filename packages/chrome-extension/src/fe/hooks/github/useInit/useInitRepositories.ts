import { github } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const useInitRepositories: Hooks.UseInitContext = () => {
  const setDraft = github.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.Github.RepositoriesResponse) => {
    if (message.meta.done) {
      setIsFetching(false);
    }
    setDraft((draft) => {
      draft.repositories = message.data;
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('github/REPOSITORIES_RESPONSE', listener);
    if (!isFetching) {
      setIsFetching(true);
      chrome.runtime.send({ type: 'github/REPOSITORIES_FETCH' });
    }
    return hangup;
  };

  return init;
};

export default useInitRepositories;
