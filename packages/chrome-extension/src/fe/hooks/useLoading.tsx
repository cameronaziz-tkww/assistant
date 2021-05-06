import { useEffect, useState } from 'react';
import { chrome } from '../../utils';

interface UseLoadingConfig {
  initial?: boolean;
  delay?: number;
}

const useLoading = <T extends Runtime.Loading>(loadingKey: T, config?: UseLoadingConfig): [boolean] => {
  const { initial, delay } = config || {};
  const [isLoading, setIsLoading] = useState(!!initial);
  const amountDelay = delay || 0;
  const [startTime, setStartTime] = useState<number>(new Date().getTime() - amountDelay);

  useEffect(
    () => {
      const hangupStopLoading = chrome.runtime.listen('STOP_LOADING', stopLoading);
      const hangupStartLoading = chrome.runtime.listen('START_LOADING', startLoading);

      return () => {
        hangupStopLoading();
        hangupStartLoading();
      };
    },
    [],
  );

  const stopLoading = (message: Runtime.StopLoading) => {
    if (message.loading === loadingKey) {
      setIsLoading(false);
    }

    // const stopTime = new Date().getTime();
    // const timeRemaining = startTime - stopTime - amountDelay;
    // if (timeRemaining < 0) {
    //     setIsLoading(false);
    //     return;
    //   }
    //   setTimeout(
    //     () => {
    //       setIsLoading(false);
    //     },
    //     timeRemaining
    //   );
    // }
  };

  const startLoading = (message: Runtime.StartLoading) => {
    if (message.loading === loadingKey) {
      setStartTime(startTime);
    }

    //   const startTime = new Date().getTime();
    //   setStartTime(startTime)
    //   setIsLoading(true);
    // }
  };

  return [isLoading];
};

export default useLoading;
