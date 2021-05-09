import { Reactor } from '@utils';
import produce, { Draft } from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface GlobalContextValue {
  rememberSelections: boolean;
  storedFilters: Storage.Global.StoredFilter[];
  visibleUnits: App.VisibleUnit[];
  hasInit: App.GlobalContextInit[];
  reactor: Reactor<'filter'>;
}

const initialState: GlobalContextValue = {
  rememberSelections: false,
  hasInit: [],
  storedFilters: [],
  visibleUnits: [],
  reactor: new Reactor<'filter'>(),
};

interface DraftUpdater<T> {
  (draft: Draft<T>): void
}

interface SetDraft<T> {
  (draftUpdater: DraftUpdater<T>): void
}

const useGlobalState = () => useState(initialState);

const {
  Provider,
  useTrackedState,
  useUpdate,
} = createContainer(useGlobalState);

const useSetDraft = (): SetDraft<GlobalContextValue> => {
  const setState = useUpdate();

  return useCallback(
    (draftUpdater) => {
      setState(produce(draftUpdater));
    },
    [setState],
  );
};

export {
  Provider as GlobalProvider,
  useTrackedState as useGlobalTrackedState,
  useSetDraft as useGlobalSetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

