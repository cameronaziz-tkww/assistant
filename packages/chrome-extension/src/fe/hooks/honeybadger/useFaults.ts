// import { honeybadger } from '@context';
import { useEffect } from 'react';
import useInit from './useInit';

const useFaults: Hooks.Honeybadger.UseFaults = () => {
  // const setDraft = honeybadger.useSetDraft();
  // const trackedState = honeybadger.useTrackedState();
  const { init } = useInit();

  useEffect(
    () => {
      const hangup = init('faults');

      // return () => {
      //   hangup();
      // };
    },
    [],
  );

  return {
    faults: [],
  };
};

export default useFaults;

