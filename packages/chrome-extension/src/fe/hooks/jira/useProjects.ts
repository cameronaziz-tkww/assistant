import { jira } from '@context';
import { chrome } from '@utils';
import { useCallback, useEffect } from 'react';
import useInit from './useInit';

const useProjects: Hooks.Jira.UseProjects = () => {
  const trackedState = jira.useTrackedState();
  const { init } = useInit();

  useEffect(
    () => {
      const hangup = init('projects');

      // return () => {
      //   hangup();
      // };
    },
    [],
  );

  const updateWatched = useCallback(
    (watched: Hooks.Jira.UpdateWatched) => {
      chrome.runtime.send({
        type: 'jira/PROJECTS_UPDATE_WATCHED',
        ...watched,
      });
    },
    [],
  );

  const projects = {
    all: trackedState.allProjects,
    watches: trackedState.watches,
    watchedProjects: trackedState.allProjects.filter((project) => trackedState.watches[project.id]?.statuses.length > 0),
  };

  return {
    projects,
    updateWatched,
  };
};

export default useProjects;
