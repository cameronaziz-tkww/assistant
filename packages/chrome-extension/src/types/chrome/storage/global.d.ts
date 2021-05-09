declare namespace Storage {
  namespace Global {
    interface All {
      filters: FilterSettings;
      visibleUnits: App.VisibleUnit[]
    }

    interface FilterSettings {
      rememberSelections: boolean;
      storedFilters: StoredFilter[];
    }

    interface StoredFilter {
      groupId: string;
      state: App.Filter.FilterState;
      full: string;
    }
  }
}
