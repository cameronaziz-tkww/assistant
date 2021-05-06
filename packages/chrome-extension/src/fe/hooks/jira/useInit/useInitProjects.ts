import { jira } from '@context';
import { chrome } from '@utils';
import { useCallback, useRef } from 'react';

const useInitProjects: Hooks.UseInitContext = () => {
  const setDraft = jira.useSetDraft();
  const isFetching = useRef(false);

  const listener = (message: Runtime.Jira.ProjectsResponse) => {
    if (message.meta.done) {
      isFetching.current = false;
    }

    setDraft((draft) => {
      const { projects, watched } = message.data;
      draft.allProjects = projects;
      draft.watches = watched;
    });
  };

  const init = useCallback(
    () => {
      const hangup =
        chrome.runtime.listen('jira/PROJECTS_RESPONSE', listener);
      if (!isFetching.current) {
        isFetching.current = true;
        chrome.runtime.send({ type: 'jira/PROJECTS_FETCH' });
      }

      return hangup;
    },
    [],
  );

  return init;
};

export default useInitProjects;
