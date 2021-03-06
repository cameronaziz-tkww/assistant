declare namespace Hooks {
  namespace Global {
    type UseRememberSelectionsDispatch = {
      rememberSelections: boolean;
      storeSelections<T extends App.Filter.Item>(filters: App.Filter.FilterWrapper<T>[]): void;
      setRememberSelections(nextState: boolean): void;
      init(): void;
    };

    interface UseRememberSelections {
      (): UseRememberSelectionsDispatch
    }

    interface Event {
      unit: App.Reactor.Unit;
      full: string;
      type: App.History.FeedItemType;
    }

    interface UseDispatchEventDispatch {
      dispatch(event: Event): void;
    }

    interface UseDispatchEvent {
      (): UseDispatchEventDispatch
    }

    interface UseListenEventsDispatch {
      listen(eventName: App.Reactor.FrontendEvent, callback: App.Callback<Event>): void;
    }

    interface UseListenEvents {
      (unit: App.Reactor.Unit): UseListenEventsDispatch
    }

    type UseUnitsDispatch = {
      visibleUnits: App.VisibleUnit[];
      allUnits: App.VisibleUnit[];
      setVisibleUnit(unit: App.VisibleUnit, nextState: boolean): void;
    };

    interface UseUnits {
      (): UseUnitsDispatch
    }

  }
}