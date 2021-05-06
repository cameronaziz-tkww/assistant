
import { modal } from '@context';

const useHide: Hooks.UseSelection = () => {
  const trackedState = modal.useTrackedState();

  return {
    selection: trackedState.selection,
  };
};

export default useHide;
