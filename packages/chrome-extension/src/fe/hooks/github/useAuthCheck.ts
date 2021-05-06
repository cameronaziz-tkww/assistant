import { github } from '@context';
import { chrome, messageTypes } from '@utils';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useAuthCheck: Hooks.UseAuthCheck = () => {
  const setDraft = github.useSetDraft();
  const trackedState = github.useTrackedState();

  const listener = (message: Runtime.Message) => {
    if (!guards.isAuthenticatedMessage(message, 'github')) {
      return;
    }
    const status = message.isAuthenticated ? 'is' : 'not';
    setDraft(
      (draft) => {
        draft.auth = status;
      },
    );
  };

  const check = () => {
    const message = messageTypes.isAuthenticated('github');
    const hangup = listen(message, listener);
    const type = messageTypes.authenticateCheck('github');
    send({
      type,
    });
    return hangup;
  };

  return {
    authStatus: trackedState.auth,
    check,
  };
};

export default useAuthCheck;
