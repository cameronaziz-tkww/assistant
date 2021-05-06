import { honeybadger } from '@context';
import chrome from '@utils/chrome';
import { useEffect } from 'react';
import useInit from './useInit';

const useProjects: Hooks.Honeybadger.UsePrjects = () => {
  const setDraft = honeybadger.useSetDraft();
  const trackedState = honeybadger.useTrackedState();
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

  const changeProjects = (projects: App.Honeybadger.Project[], projectId: string, nextWatchedState: boolean): App.Honeybadger.Project[] => {
    const projectIndex = projects.findIndex((project) => project.id === projectId);
    if (projectIndex > -1) {
      const replacement = {
        ...projects[projectIndex],
        isWatched: nextWatchedState,
      };
      return [
        ...projects.slice(0, projectIndex),
        replacement,
        ...projects.slice(projectIndex),
      ];
    }
    return [
      ...projects,
      {
        id: projectId,
        isWatched: nextWatchedState,
      },
    ];
  };

  const updateProjects = (id: string, nextWatchedState: boolean) => {
    const projects = changeProjects(trackedState.projects, id, nextWatchedState);
    chrome.runtime.send({
      type: 'STORAGE_SET',
      key: 'honeybadgerProjects',
      data: projects,
    });

    setDraft(
      (draft) => {
        draft.projects = changeProjects(draft.projects, id, nextWatchedState);
      },
    );
  };

  return {
    watchedProjects: trackedState.projects.filter((project) => project.isWatched),
    allProjects: trackedState.projects.filter((project) => project.isWatched),
    updateProjects,
  };
};

export default useProjects;

