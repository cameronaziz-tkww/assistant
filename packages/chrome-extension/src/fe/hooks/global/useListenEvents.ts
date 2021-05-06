import { global } from '@context';
import { useCallback } from 'react';

const useListenEvents: Hooks.Global.UseListenEvents = (unit) => {
  const trackedState = global.useTrackedState();

  const listen = useCallback(
    (eventName: App.Reactor.FrontendEvent, callback: App.Callback<Hooks.Global.Event>) => {
      const { reactor } = trackedState;
      const localCallback: App.Callback<Hooks.Global.Event> = (event) => {
        if (event.unit === unit) {
          callback(event);
        }
      };
      reactor.addEventListener(eventName, localCallback);
    },
    [],
  );

  return {
    listen,
  };
};

export default useListenEvents;
