import { honeybadger } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const useInitProjects: Hooks.UseInitContext = () => {
  const setDraft = honeybadger.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.Honeybadger.ProjectsResponse) => {
    if (message.meta.done) {
      setIsFetching(false);
    }

    setDraft((draft) => {
      draft.projects = message.data;
    });
  };

  const init = () => {
    const hangup =
      chrome.runtime.listen('honeybadger/PROJECTS_RESPONSE', listener);
    if (!isFetching) {
      setIsFetching(true);
      chrome.runtime.send({ type: 'honeybadger/PROJECTS_FETCH' });
    }

    return hangup;
  };

  return init;
};

export default useInitProjects;
