import { github } from '@context';
import { chrome } from '@utils';
import { useCallback } from 'react';

const useRepositories: Hooks.Github.UseRepositories = () => {
  const setDraft = github.useSetDraft();
  const { repositories } = github.useTrackedState();

  const updateWatched = useCallback(
    (repository: App.Github.Repository) => {
      setDraft((draft) => {

        const index = draft.repositories.findIndex((draftRepository) => draftRepository.fullName === repository.fullName);
        if (index < 0) {
          return;
        }
        draft.repositories[index] = repository;
      });

      chrome.runtime.send({
        type: 'github/REPOSITORIES_UPDATE_WATCHED',
        nextIsWatched: repository.isWatched,
        id: repository.id,
      });
    },
    [],
  );

  const unwatched = repositories.filter((repo) => !repo.isWatched);

  const state = {
    all: repositories,
    watched: repositories.filter((repo) => repo.isWatched),
    unwatched,
  };

  return {
    repositories: state,
    updateWatched,
  };
};

export default useRepositories;
