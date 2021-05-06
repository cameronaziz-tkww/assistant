import { useFiltersTrackedState } from '@context/filters';
import { useEffect, useRef } from 'react';

const useGetFilter = <T extends App.Filter.Item>(): Hooks.Filters.UseGetFilterDispatch<T> => {
  const trackedState = useFiltersTrackedState();
  const trackedStateRef = useRef(trackedState);

  useEffect(
    () => {
      trackedStateRef.current = trackedState;
    },
    [trackedState],
  );

  const isGithub = (unknown: App.History.FeedItemType, unit: App.Reactor.Unit): unknown is App.History.GithubFeedItemType =>
    unit === 'github';

  const getKey = (type: App.History.FeedItemType, unit: App.Reactor.Unit): App.Jira.FilterableKeys | App.Github.FilterableKeys => {
    if (isGithub(type, unit)) {
      return 'createdBy';
    }

    return type;
  };

  const find = (event: Hooks.Global.Event) => {
    const name = `${event.unit}-${getKey(event.type, event.unit)}`;
    const group = trackedStateRef.current.currentFilters.find((filter) => filter.groupId === name && filter.filter.full === event.full);

    if (group) {
      return group;
    }

    return null;
  };

  return {
    find,
  };

};

export default useGetFilter;
