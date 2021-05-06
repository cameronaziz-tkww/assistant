import { CONSTANTS } from '@services/github';
import produce from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface GithubContextValue {
  auth: App.AuthStatus;
  loginName: string | undefined;
  repositories: App.Github.Repository[];
  pullRequests: App.Github.PullRequest[];
  settings: Storage.Github.SettingsStore;
  prConfig: App.Github.PullRequestConfig;
  hasInit: App.Github.ContextInit[];
}

const defaultPullRequestConfig: App.Github.PullRequestConfig = {
  mostChecks: 0,
  mostReviews: 0,
};

const initialState: GithubContextValue = {
  auth: 'is',
  hasInit: [],
  loginName: undefined,
  pullRequests: [],
  repositories: [],
  prConfig: defaultPullRequestConfig,
  settings: CONSTANTS.defaultSettings,
};

interface GithubContextProps {
  initialState?: GithubContextValue
}

const useGithubState = (props: GithubContextProps) => useState(props.initialState || initialState);

const {
  Provider,
  useTrackedState,
  useUpdate,
} = createContainer(useGithubState);

const useSetDraft = (): App.SetDraft<GithubContextValue> => {
  const setState = useUpdate();

  const setDraft = useCallback(
    (draftUpdater) => {
      setState(produce(draftUpdater));
    },
    [setState],
  );

  return setDraft;
};

export {
  Provider as GithubProvider,
  useTrackedState as useGithubTrackedState,
  useSetDraft as useGithubSetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

