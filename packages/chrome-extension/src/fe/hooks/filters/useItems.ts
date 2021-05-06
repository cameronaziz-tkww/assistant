import { filters } from '@context';

const useItems = <T extends App.Filter.Item>(): Hooks.Filters.UseItemsDispatch<T> => {
  const state = filters.useTrackedState();

  return {
    allItems: state.allItems as T[],
    filteredItems: state.filteredItems as T[],
  };
};

export default useItems;
