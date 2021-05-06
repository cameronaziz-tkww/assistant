import { CONSTANTS } from '@services/jira';
import produce from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface JiraContextValue {
  auth: App.AuthStatus;
  allProjects: App.Jira.Project[];
  watches: App.Jira.Watched;
  filters: App.Filter.FilterGroupConfig<App.Jira.Issue>[];
  issues: App.Jira.Issue[];
  settings: Storage.Jira.SettingsStore;
  hasInit: App.Jira.ContextInit[];
}

const initialState: JiraContextValue = {
  filters: [],
  allProjects: [],
  auth: 'is' as App.AuthStatus,
  issues: [],
  watches: {},
  hasInit: [],
  settings: CONSTANTS.defaultSettings,
};

const useJiraState = () => useState(initialState);

const {
  Provider,
  useTrackedState,
  useUpdate,
} = createContainer(useJiraState);

const useSetDraft = (): App.SetDraft<JiraContextValue> => {
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
  Provider as JiraProvider,
  useTrackedState as useJiraTrackedState,
  useSetDraft as useJiraSetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

