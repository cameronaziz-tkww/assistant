import counts from './counts';
import getColor from './getColor';

const groups = <T extends App.Filter.Item>(filterConfigs: App.Filter.GroupConfig<T>[], items: T[]): App.Filter.Group<T>[] =>
  filterConfigs
    .map(
      (config): App.Filter.Group<T> | void => {
        if (!config) {
          return;
        }
        const current: App.Filter.CreateMapping<T> = {};

        items.forEach((item, index) => {
          config.create(item, current, index);
        });

        const currentFilters: App.Filter.Mapping<T> =
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
            .map(([key, filter], index): App.Filter.FilterWrapper<T> & { key: string } => {
              const filterCounts = counts(config, filter.full, items);
              return {
                key,
                config,
                counts: {
                  currentCount: filterCounts,
                  total: filterCounts,
                },
                groupId: config.id,
                state: 'omit',
                filter: {
                  ...filter,
                  color: getColor(index, filter.color),
                },
              };
            })
            .reduce(
              (acc, filter) => {
                acc[filter.key] = filter;
                return acc;
              },
              {},
            );

        return {
          appliedFilters: [],
          id: config.id,
          label: config.label,
          filters: currentFilters,
          lastState: 'omit',
        };
      })
    .filter((group) => !!group) as App.Filter.Group<T>[];

export default groups;
