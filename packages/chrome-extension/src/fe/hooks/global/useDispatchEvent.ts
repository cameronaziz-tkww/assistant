import { global } from '@context';

const useDispatchEvent: Hooks.Global.UseDispatchEvent = () => {
  const trackedState = global.useTrackedState();

  const dispatch = (event: Hooks.Global.Event) => {
    const { reactor } = trackedState;
    reactor.dispatchEvent(
      'filter',
      event,
    );
  };

  return {
    dispatch,
  };
};

export default useDispatchEvent;
