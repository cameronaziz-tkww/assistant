declare namespace Hooks {
  namespace Filters {
    interface UseClickFilterDispatch<T extends App.Filter.Item> {
      handle(id: string | number, groupId: string): void;
    }

    interface UseClickFilter<T extends App.Filter.Item> {
      (): UseClickFilterDispatch<T>
    }

    interface UseGetFilterDispatch<T extends App.Filter.Item> {
      find(event: Hooks.Global.Event): App.Filter.FilterWrapper<T> | null;
    }

    interface UseGetFilter<T extends App.Filter.Item> {
      (): UseGetFilterDispatch<T>
    }
    interface UseClearFiltersDispatch {
      handle(groupId: string): void;
    }

    interface UseClearFilters {
      (): UseClearFiltersDispatch
    }

    interface UseItemsDispatch<T extends App.Filter.Item> {
      allItems: T[];
      filteredItems: T[]
    }

    interface UseApplyFilterDispatch {
      (groupId: string, itemId: string | number): void;
    }

    interface UseApplyFilter {
      (): UseApplyFilterDispatch
    }

    interface AppliedGroupFilters<T extends App.Filter.Item> {
      config: App.Filter.GroupConfig<T>;
      state: App.Filter.FilterState;
      applied: App.Filter.AppliedFilter[];
      groupId: string;
    }

    interface ByGroup<T extends App.Filter.Item> {
      [groupId: string]: AppliedGroupFilters<T>
    }

    interface UseAppliedFiltersDispatch<T extends App.Filter.Item> {
      configs: Other.Immer.Immutable<App.Filter.GroupConfig<T>[]>;
      appliedFilters: Other.Immer.Immutable<App.Filter.AppliedFilter[]>;
      appliedFiltersByGroup: ByGroup;
    }

    interface UseAppliedFilters {
      (): UseAppliedFiltersDispatch
    }

    interface UseFilterGroupsDispatch<T extends App.Filter.Item> {
      groups: App.Filter.Group<T>[]
    }

    interface UseFilterGroupFiltersDispatch<T extends App.Filter.Item> {
      filters: App.Filter.FilterWrapper<T>[]
    }

    interface UseItems<T extends App.Filter.Item> {
      (): UseItemsDispatch<T>
    }

    interface UseUpdateItemsDispatch<T extends App.Filter.Item> {
      handle(items: T[]): void;
    }

    interface UseUpdateItems<T extends App.Filter.Item> {
      (): UseUpdateItemsDispatch<T>
    }

  }
}