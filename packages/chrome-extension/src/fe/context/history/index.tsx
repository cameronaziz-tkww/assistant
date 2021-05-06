import produce from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface HistoryContextValue {
  hasInit: App.History.ContextInit[];
  feed: App.History.FeedItem[]
}

const initialState: HistoryContextValue = {
  hasInit: [],
  feed: [],
};

interface HistoryContextProps {
  initialState?: HistoryContextValue
}

const useHistoryState = (props: HistoryContextProps) => useState(props.initialState || initialState);

const {
  Provider,
  useTrackedState,
  useUpdate,
} = createContainer(useHistoryState);

const useSetDraft = (): App.SetDraft<HistoryContextValue> => {
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
  Provider as HistoryProvider,
  useTrackedState as useHistoryTrackedState,
  useSetDraft as useHistorySetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

