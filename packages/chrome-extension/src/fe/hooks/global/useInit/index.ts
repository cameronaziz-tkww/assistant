import { global } from '@context';
import { chrome } from '@utils';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useInit: Hooks.UseInit<App.GlobalContextInit> = () => {
  const { hasInit } = global.useTrackedState();
  const setDraft = global.useSetDraft();

  const storageOn = (message: Runtime.StorageOn) => {
    if (guards.filters(message)) {
      const { rememberSelections } = message.data;
      setDraft((draft) => {
        draft.rememberSelections = rememberSelections;
      });
      return;
    }

    if (guards.visibleUnits(message)) {
      const { data } = message;
      setDraft((draft) => {
        draft.visibleUnits = data;
      });
      return;
    }
  };

  const getStorageKey = (initType: App.GlobalContextInit): keyof Storage.Global.All => {
    switch (initType) {
      case 'filters': return 'filters';
      case 'units': return 'visibleUnits';
      default: throw Error('Bad Init Type');
    }
  };

  const init = (initType: App.GlobalContextInit) => {
    if (!hasInit.includes(initType)) {
      const hangup = listen('STORAGE_ON', storageOn);
      setDraft((draft) => {
        draft.hasInit = [...draft.hasInit, initType];
      });
      send({ type: 'STORAGE_GET', key: getStorageKey(initType) });

      return true;
    }

    return false;
  };

  return {
    hasInit,
    init,
  };
};

export default useInit;
