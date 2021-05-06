import { jira } from '@context';
import useGeneric from '../useAuthCheck';

const useAuthCheck: Hooks.UseAuthCheck = () => {
  const setDraft = jira.useSetDraft();
  const trackedState = jira.useTrackedState();

  const listener = (status: App.AuthStatus) => {
    setDraft(
      (draft) => {
        draft.auth = status;
      },
    );
  };

  const { check } = useGeneric('jira', listener);

  return {
    check,
    authStatus: trackedState.auth,
  };
};

export default useAuthCheck;
