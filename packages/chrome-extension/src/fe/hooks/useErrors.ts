import { chrome } from '@utils';
import { useEffect, useState } from "react";

const useErrors: Hooks.UseErrors = (unit) => {
  const [errorMessage, setError] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);

  const listen = (message: Runtime.Error.ServiceError): void => {
    if (message.unit === unit) {
      setError(message.message);
      setSendId(message.meta.id);
    }
  };

  useEffect(
    () => {
      const hangup = chrome.runtime.listen('error/SERVICE_ERROR', listen);

      return () => {
        hangup();
      };
    },
    [],
  );

  return {
    errorMessage,
    sendId,
  };
};

export default useErrors;
