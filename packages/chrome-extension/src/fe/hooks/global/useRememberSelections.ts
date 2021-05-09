import { global } from '@context';
import { chrome } from '@utils';
import useInit from './useInit';

const useRememberSelections: Hooks.Global.UseRememberSelections = () => {
  const { rememberSelections } = global.useTrackedState();
  const initialize = useInit();

  const init = () => {
    initialize.init('filters');
  };

  const storeSelections = <T extends App.Filter.Item>(filters: App.Filter.FilterWrapper<T>[]) => {
    if (rememberSelections) {
      const opinionatedFilters = filters.filter((filter) => filter.state !== 'omit');
      chrome.runtime.send({
        type: 'STORAGE_SET',
        key: 'filters',
        data: {
          storedFilters: opinionatedFilters,
          rememberSelections: true,
        },
      });
    }
  };

  const setRememberSelections = (nextState: boolean) => {
    chrome.runtime.send({
      type: 'STORAGE_SET',
      key: 'filters',
      data: {
        rememberSelections: nextState,
        storedFilters: [],
      },
    });
  };

  return {
    rememberSelections,
    setRememberSelections,
    storeSelections,
    init,
  };
};

export default useRememberSelections;
