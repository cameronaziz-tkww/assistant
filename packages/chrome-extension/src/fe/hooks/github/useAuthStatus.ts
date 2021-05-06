import { github } from '@context';
import { chrome, messageTypes } from '@utils';

const useAuthStatus: Hooks.UseAuthStatus = () => {
  const setDraft = github.useSetDraft();
  const trackedState = github.useTrackedState();

  const logout = () => {
    setDraft((draft) => {
      draft.auth = 'not';
    });

    chrome.runtime.send({
      type: messageTypes.logout('github'),
    });
  };

  return {
    logout,
    authStatus: trackedState.auth,
  };
};

export default useAuthStatus;
