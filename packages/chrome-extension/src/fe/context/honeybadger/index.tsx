import produce, { Draft } from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface DraftUpdater<T> {
  (draft: Draft<T>): void
}

interface SetDraft<T> {
  (draftUpdater: DraftUpdater<T>): void
}

interface HoneybadgerContextValue {
  auth: App.AuthStatus;
  hasInit: App.Honeybadger.ContextInit[];
  projects: App.Honeybadger.Project[];
  monitors: App.Honeybadger.Monitor[];
}

const initialState: HoneybadgerContextValue = {
  auth: 'is' as App.AuthStatus,
  hasInit: [],
  projects: [],
  monitors: [],
};

const useHoneybadgerState = () => useState(initialState);

const {
  Provider,
  useTrackedState,
  useUpdate: useSetHoneybadgerUpdate,
} = createContainer(useHoneybadgerState);

const useSetDraft = (): SetDraft<HoneybadgerContextValue> => {
  const setState = useSetHoneybadgerUpdate();
  return useCallback(
    (draftUpdater) => {
      setState(produce(draftUpdater));
    },
    [setState],
  );
};

export {
  Provider as HoneybadgerProvider,
  useTrackedState as useHoneybadgerTrackedState,
  useSetDraft as useHoneybadgerSetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

