import produce from 'immer';
import { useCallback, useState } from 'react';
import { createContainer } from 'react-tracked';

interface ModalContextValue {
  hiddenUnits: App.Unit[];
  selectionRef: HTMLDivElement | null;
  selection: App.SettingsTab | 'save' | null;
}

const initialState = {
  hiddenUnits: [] as App.Unit[],
  selection: null,
  selectionRef: null,
};

const useModalState = () => useState(initialState);

const {
  Provider,
  useTrackedState,
  useUpdate: useSetModalUpdate,
} = createContainer(useModalState);

const useSetDraft = (): App.SetDraft<ModalContextValue> => {
  const setState = useSetModalUpdate();
  return useCallback(
    (draftUpdater) => {
      setState(produce(draftUpdater));
    },
    [setState],
  );
};

export {
  Provider as ModalProvider,
  useTrackedState as useModalTrackedState,
  useSetDraft as useModalSetDraft,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
};
