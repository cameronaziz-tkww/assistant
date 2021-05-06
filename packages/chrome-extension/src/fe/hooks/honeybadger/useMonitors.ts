import { honeybadger } from '@context';
import { chrome } from '@utils';
import { useCallback, useEffect } from 'react';
import useInit from './useInit';

const useMonitors: Hooks.Honeybadger.UseMonitors = () => {
  const setDraft = honeybadger.useSetDraft();
  const trackedState = honeybadger.useTrackedState();
  const { init } = useInit();

  useEffect(
    () => {
      init('settings');
    },
    [],
  );

  const getChange = (monitor: App.Honeybadger.Monitor, monitors: App.Honeybadger.Monitor[], nextAddState: boolean) => {
    if (nextAddState) {
      return [...monitors, monitor];
    }
    return monitors.filter((m) => m.noticeLimit !== monitor.noticeLimit && m.timeAgo !== monitor.timeAgo);
  };

  const updateMonitor = useCallback(
    (monitor: App.Honeybadger.Monitor, nextAddState: boolean) => {
      setDraft((draft) => {
        draft.monitors = getChange(monitor, draft.monitors, nextAddState);
        return draft;
      });

      chrome.runtime.send({
        type: 'STORAGE_SET',
        key: 'honeybadgerSettings',
        data: {
          monitors: getChange(monitor, trackedState.monitors, nextAddState),
        },
      });
    },
    [],
  );

  return {
    monitors: trackedState.monitors,
    updateMonitor,
  };
};

export default useMonitors;

