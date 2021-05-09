
declare namespace App {
  import { ReactNode } from 'react';
  import { Immutable } from 'immer';

  type UnitColumn = 'first' | 'second' | 'third' | 'none';
  namespace Filter {

    type Item = App.Jira.Issue | App.Github.PullRequest
    type FilterableItems<T> = Record<T, FilterSetting<T>>

    interface FilterSetting<T> {
      label: string;
      key: T;
    }

    type FilterState = 'include' | 'exclude' | 'omit';

    interface FilterWrapper<T = Item> {
      state: FilterState;
      groupId: string;
      filter: Filter<T>;
      counts: Counts;
      config: GroupConfig<T>
    }

    interface Counts {
      total: number;
      currentCount: number;
    }

    type Search<T extends Item> = {
      [state in FilterState]: Filter<T>[]
    }
    interface SearchState<T extends Item> {
      [groupId as string]: Search<T>;
    }

    interface Group<T extends Item> {
      id: string;
      label?: string;
      filters: Mapping<T>;
      appliedFilters: AppliedFilter[];
      lastState: FilterState;
    }

    interface AppliedFilter {
      state: FilterState;
      groupId: string;
      itemId: string | number;
    }
    interface Filter<T extends Item> {
      capitalize?: boolean;
      abbreviation: string;
      full: string;
      tooltip?: ReactNode;
      color?: string;
      id: number | string;
    }

    interface CreateMapping<T extends Item> {
      [full: string]: Filter<T>;
    }

    interface Mapping<T extends Item> {
      [full: string]: FilterWrapper<T>;
    }

    interface Create<T extends Item> {
      (item: T, mapping: CreateMapping<T>, index: number): void;
    }

    interface GroupConfig<T extends Item> {
      id: string;
      label?: string;
      create: Create<T>;
      run<T extends Item>(item: T, id: string | number): boolean;
    }

    type FilterMapping<T extends string> = {
      [key in T]: GroupConfig
    }
  }
}
