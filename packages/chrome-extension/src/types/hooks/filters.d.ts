declare namespace Hooks {
  namespace Filters {
    interface UseClickFilterDispatch<T extends App.Filter.Item> {
      handle(filter: App.Filter.Current<T>): void;
    }

    interface UseClickFilter<T extends App.Filter.Item> {
      (): UseClickFilterDispatch<T>
    }

    interface UseGetFilterDispatch<T extends App.Filter.Item> {
      find(event: Hooks.Global.Event): App.Filter.FilterItem<T> | null;
    }

    interface UseGetFilter<T extends App.Filter.Item> {
      (): UseGetFilterDispatch<T>
    }

    interface UseClickFilterDispatch<T extends App.Filter.Item> {
      handle(filter: App.Filter.Current<T>): void;
    }

    interface UseClickFilter<T extends App.Filter.Item> {
      (): UseClickFilterDispatch<T>
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

    interface UseFilterGroupsDispatch<T extends App.Filter.Item> {
      groups: App.Filter.CurrentFilterGroup<T>[]
    }

    interface UseFilterGroupFiltersDispatch<T extends App.Filter.Item> {
      filters: App.Filter.FilterItem<T>[]
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