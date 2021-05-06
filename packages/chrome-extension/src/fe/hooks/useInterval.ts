import { useEffect, useRef } from 'react';

const useInterval = (callback: App.EmptyCallback, delay?: number | null): void => {
  const savedCallback = useRef<App.EmptyCallback | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
