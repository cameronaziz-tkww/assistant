import { chrome, messageTypes } from '@utils';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useAuthCheck: Hooks.UseAuthCheckGeneric = (unit, listener) => {
  const localListener = (message: Runtime.Message) => {
    if (guards.isAuthenticatedMessage(message, unit)) {
      const status = message.isAuthenticated ? 'is' : 'not';
      listener(status);
    }
  };

  const check = (): App.EmptyCallback<void> => {
    const message = messageTypes.isAuthenticated(unit);
    const hangup = listen(message, localListener);
    const type = messageTypes.authenticateCheck(unit);
    send({
      type,
    });
    return hangup;
  };

  return {
    check,
  };
};

export default useAuthCheck;
