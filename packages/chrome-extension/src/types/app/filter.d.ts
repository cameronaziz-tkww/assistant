
declare namespace App {
  import { ReactNode } from "react";
  type UnitColumn = 'first' | 'second' | 'third' | 'none';
  namespace Filter {

    type Item = App.Jira.Issue | App.Github.PullRequest
    type FilterableItems<T> = Record<T, FilterSetting<T>>

    interface FilterSetting<T> {
      label: string;
      key: T;
    }

    type FilterState = 'include' | 'exclude' | 'omit';

    interface FilterItem<T = Item> {
      state: FilterState;
      groupId: string;
      filter: Filter;
      counts: Counts;
      config: FilterGroupConfig<T>
    }

    interface Counts {
      total: number;
      currentCount: number;
    }

    // interface FilterGroup {
    //   id: string;
    //   label?: string;
    //   lastState: FilterState;
    //   filters: CreateMapping;
    // }

    type Search<T extends Item> = {
      [state in FilterState]: FilterItem<T>[]
    }
    interface SearchState<T extends Item> {
      [groupId as string]: Search<T>;
    }

    interface CurrentFilterGroup<T extends Item> {
      id: string;
      label?: string;
      filters: Mapping<T>;
      lastState: FilterState;
    }

    interface Filter {
      capitalize?: boolean;
      abbreviation: string;
      full: string;
      tooltip?: ReactNode;
      color?: string;
      id: number | string;
    }

    interface CreateMapping {
      [full: string]: Filter;
    }

    interface Mapping<T extends Item> {
      [full: string]: FilterItem<T>;
    }

    interface Create {
      <T extends Item>(item: T, mapping: CreateMapping, index: number): void;
    }

    interface FilterGroupConfig<T extends Item> {
      id: string;
      label?: string;
      create: Create<T>;
      run<T extends Item>(item: T, full: string, index: number): boolean;
    }

    type FilterMapping<T extends string> = {
      [key in T]: FilterGroupConfig
    }
  }
}
