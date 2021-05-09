import { filterBuilder } from '@utils';
import produce, { Draft, Immutable } from 'immer';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { createContainer } from 'react-tracked';

export interface FiltersContextValue<T extends App.Filter.Item> {
  filterGroups: App.Filter.Group<T>[];
  currentFilters: App.Filter.FilterWrapper<T>[];
  filteredItems: T[];
  allItems: T[];
  filterConfigs: App.Filter.GroupConfig<T>[];
}

const initialState = {
  currentFilters: [],
  filterGroups: [],
  filterConfigs: [],
  allItems: [],
  filteredItems: [],
};

export interface FiltersContextProviderProps<T extends App.Filter.Item> {
  hideFilters?: boolean;
  items: T[];
  filterConfigs: App.Filter.GroupConfig<T>[];
}

interface DraftUpdater<T> {
  (draft: Draft<T>): void
}

interface SetDraft<T> {
  (draftUpdater: DraftUpdater<T>): void
}

type Update = App.UnknownFunction<FiltersContextValue<App.Filter.Item>, Immutable<FiltersContextValue<App.Filter.Item>> | void>

const useFiltersState = <T extends App.Filter.Item>(props: FiltersContextProviderProps<T>) => {
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

  return [state, setState] as [FiltersContextValue<T>, Dispatch<SetStateAction<FiltersContextValue<T>>>];
};

const {
  Provider,
  useTrackedState,
  useUpdate,
  useSelector,
} = createContainer<Immutable<FiltersContextValue<App.Filter.Item>>, Update, FiltersContextProviderProps<App.Filter.Item>>(useFiltersState);

const useSetDraft = (): SetDraft<FiltersContextValue<App.Filter.Item>> => {
  const setState = useUpdate();

  return useCallback(
    (draftUpdater) => {
      const production = produce<Update>(draftUpdater);
      setState(production as unknown as App.ShouldDefineType);
    },
    [setState],
  );
};

export {
  Provider as FiltersProvider,
  useTrackedState as useFiltersState,
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

