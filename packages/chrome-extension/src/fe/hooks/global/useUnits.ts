import { global } from '@context';
import { CONSTANTS } from '@services/units';
import { chrome } from '@utils';
import { useEffect } from 'react';
import useInit from './useInit';

const useUnits: Hooks.Global.UseUnits = () => {
  const { visibleUnits } = global.useTrackedState();
  const setDraft = global.useSetDraft();
  const { init } = useInit();

  useEffect(
    () => {
      const hangup = init('units');

      // return () => {
      //   hangup();
      // };
    },
    [],
  );

  const setVisibleUnit = (unit: App.VisibleUnit, nextState: boolean) => {
    const units = nextState ? [...visibleUnits, unit] : visibleUnits.filter((u) => u !== unit);

    setDraft((draft) => {
      draft.visibleUnits = units;
    });

    chrome.runtime.send({
      type: 'STORAGE_SET',
      key: 'visibleUnits',
      data: units,
    });

  };
  return {
    allUnits: CONSTANTS.allVisibleUnits,
    visibleUnits,
    setVisibleUnit,
  };
};

export default useUnits;
