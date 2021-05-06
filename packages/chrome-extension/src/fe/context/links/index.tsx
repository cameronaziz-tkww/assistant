import type { Draft } from 'immer';
import produce from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface LinksContextValue {
  custom: App.Links.CustomConfig[];
  hasInit: App.Links.ContextInit[];
  // stagingCustom: App.Links.CustomConfig[];
  // stagingStandard: App.Links.StandardBuiltConfig[];
  standard: App.Links.StandardBuiltConfig[];
}

const initialState: LinksContextValue = {
  custom: [],
  hasInit: [],
  // stagingCustom: [],
  // stagingStandard: [],
  standard: [],
};

interface DraftUpdater<T> {
  (draft: Draft<T>): void
}

interface SetDraft<T> {
  (draftUpdater: DraftUpdater<T>): void
}

const useLinksState = () => useState(initialState);

const {
  Provider,
  useTrackedState,
  useUpdate,
} = createContainer(useLinksState);

const useSetDraft = (): SetDraft<LinksContextValue> => {
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
  Provider as LinksProvider,
  useTrackedState as useLinksTrackedState,
  useSetDraft as useLinksSetDraft,
  LinksContextValue,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};

