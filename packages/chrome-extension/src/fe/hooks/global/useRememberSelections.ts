import { global } from '@context';
import { chrome } from '@utils';
import { useEffect } from 'react';
import useInit from './useInit';

const useRememberSelections: Hooks.Global.UseRememberSelections = () => {
  const trackedState = global.useTrackedState();
  const { init } = useInit();

  useEffect(
    () => {
      const hangup = init('filters');

      // return () => {
      //   hangup();
      // };
    },
    [],
  );

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
    rememberSelections: trackedState.rememberSelections,
    setRememberSelections,
  };
};

export default useRememberSelections;
