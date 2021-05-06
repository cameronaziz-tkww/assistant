import counts from './counts';
import getColor from './getColor';

const groups = <T extends App.Filter.Item>(filterConfigs: App.Filter.FilterGroupConfig<T>[], items: T[]): App.Filter.CurrentFilterGroup<T>[] =>
  filterConfigs
    .map(
      (config): App.Filter.CurrentFilterGroup<T> | void => {
        if (!config) {
          return;
        }
        const current: App.Filter.CreateMapping = {};

        items.forEach((item, index) => {
          config.create(item, current, index);
        });

        const currentFilters =
          Object
            .entries(current)
            .sort(([, a], [, b]) => {
              if (a.abbreviation < b.abbreviation) {
                return -1;
              }

              if (a.abbreviation > b.abbreviation) {
                return 1;
              }

              return 0;
            })
            .map(([key, filter], index) => [
              key,
              {
                groupId: config.id,
                state: 'omit',
                filter: {
                  ...filter,
                  color: getColor(index, filter.color),
                },
              },
            ] as [string, App.Filter.FilterItem<T>])
            .reduce(
              (acc, [key, filter]) => {
                const filterCounts = counts(config, filter.filter.full, items);
                filter.counts = {
                  currentCount: filterCounts,
                  total: filterCounts,
                };
                filter.config = config;
                acc[key] = filter;
                return acc;
              },
              {} as App.Filter.Mapping<T>,
            );

        return {
          id: config.id,
          label: config.label,
          filters: currentFilters,
          lastState: 'omit',
        };
      })
    .filter((group) => !!group) as App.Filter.CurrentFilterGroup<T>[];

export default groups;
