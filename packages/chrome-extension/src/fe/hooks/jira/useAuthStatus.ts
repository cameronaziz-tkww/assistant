import { jira } from '@context';
import { chrome, messageTypes } from '@utils';

const useAuthStatus: Hooks.UseAuthStatus = () => {
  const { auth } = jira.useTrackedState();
  const setDraft = jira.useSetDraft();

  const logout = () => {
    setDraft((draft) => {
      draft.auth = 'not';
    });

    chrome.runtime.send({
      type: messageTypes.logout('jira'),
    });
  };

  return {
    authStatus: auth,
    logout,
  };
};

export default useAuthStatus;