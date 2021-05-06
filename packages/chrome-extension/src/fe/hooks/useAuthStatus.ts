import { chrome, messageTypes } from '@utils';

const useAuthStatus = <T extends Hooks.AuthContext>(unit: App.Unit, trackedState: T, setDraft: App.SetDraft<T>): Hooks.UseAuthStatusDispatch => {
  const logout = () => {
    setDraft((draft) => {
      draft.auth = 'not';
    });

    chrome.runtime.send({
      type: messageTypes.logout(unit),
    });
  };

  return {
    authStatus: trackedState.auth,
    logout,
  };
};

export default useAuthStatus;
