import { filterBuilder } from '@utils';
import produce, { Draft } from 'immer';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { createContainer } from 'react-tracked';

export interface FiltersContextValue<T extends App.Filter.Item> {
  filterGroups: App.Filter.CurrentFilterGroup<T>[];
  currentFilters: App.Filter.FilterItem<T>[];
  filteredItems: T[];
  allItems: T[];
  filterConfigs: App.Filter.FilterGroupConfig<T>[]
}

const initialState: FiltersContextValue<App.Filter.Item> = {
  currentFilters: [],
  filterGroups: [],
  filterConfigs: [],
  allItems: [],
  filteredItems: [],
};

export interface FiltersContextProviderProps<T extends App.Filter.Item> {
  hideFilters?: boolean;
  items: T[];
  filterConfigs: App.Filter.FilterGroupConfig<T>[];
}

interface DraftUpdater<T> {
  (draft: Draft<T>): void
}

interface SetDraft<T> {
  (draftUpdater: DraftUpdater<T>): void
}

const useFiltersState = (props: FiltersContextProviderProps<App.Filter.Item>) => {
  const items = JSON.parse(JSON.stringify(props.items));
  const [state, setState] = useState(filterBuilder.parseProps(
    {
      ...props,
      items,
    },
    initialState,
  ));

  useEffect(
    () => {
      if (props) {
        const items = JSON.parse(JSON.stringify(props.items));
        setState(filterBuilder.parseProps(
          {
            ...props,
            items,
          },
          initialState,
        ));
      }
    },
    [props],
  );

  return [state, setState] as [FiltersContextValue<App.Filter.Item>, Dispatch<SetStateAction<FiltersContextValue<App.Filter.Item>>>];
};

const {
  Provider,
  useTrackedState,
  useUpdate,
  useSelector,
} = createContainer(useFiltersState);

const useSetDraft = (): SetDraft<FiltersContextValue<App.Filter.Item>> => {
  const setState = useUpdate();

  return useCallback(
    (draftUpdater) => {
      setState(produce(draftUpdater));
    },
    [setState],
  );
};

export {
  Provider as FiltersProvider,
  useTrackedState as useFiltersTrackedState,
  useSetDraft as useFiltersSetDraft,
  useSelector as useFiltersSelector,
};

export default {
  Provider,
  useTrackedState,
  useSetDraft,
  useSelector,
};

