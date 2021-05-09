import { github } from '@context';
import { chrome, throttle } from '@utils';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useState } from 'react';

const useRepositories: Hooks.Github.UseRepositories = () => {
  const setDraft = github.useSetDraft();
  const { repositories } = github.useTrackedState();
  const [localRepositories, setLocalRepositories] = useState(repositories);

  useEffect(
    () => {
      setLocalRepositories(repositories);
    },
    [repositories],
  );

  const filter = throttle((value: string) => {
    if (value.length === 0) {
      setLocalRepositories(repositories);
      return;
    }
    const options: Fuse.IFuseOptions<App.Github.Repository> = {
      isCaseSensitive: false,
      keys: [{
        name: 'name',
        weight: 0.8,
      },
      {
        name: 'organizationName',
        weight: 0.2,
      }],
    };

    const fuse = new Fuse(repositories, options);

    const result = fuse.search(value);
    setLocalRepositories(result.map((item) => item.item));
  }, 100);

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

  const unwatched = localRepositories.filter((repo) => !repo.isWatched);

  const state = {
    all: localRepositories,
    watched: localRepositories.filter((repo) => repo.isWatched),
    unwatched,
  };

  return {
    repositories: state,
    updateWatched,
    filter,
  };
};

export default useRepositories;
