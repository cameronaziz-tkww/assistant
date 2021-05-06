
declare namespace Hooks {
  interface DraftUpdater<T> {
    (draft: Draft<T>): void
  }

  type AccessorValue = [listen: () => () => void, get: () => void];

  interface Accessor<T> {
    (setDraft: (updater: DraftUpdater<T>) => void): AccessorValue;
  }

  // interface UseInitContextDispatch {
  //   init(): void;
  //   cancel(): void;
  // }

  interface UseInitContextDispatch {
    (): App.EmptyCallback;
  }

  interface UseInitContext {
    (): UseInitContextDispatch;
  }

  interface UseInitDispatch<T> {
    init: (init: T) => boolean;
    hasInit: T[]
  }

  interface UseInit<T> {
    (): UseInitDispatch<T>;
  }

  type UseAuthStatusDispatch = {
    logout: App.EmptyCallback;
    authStatus: App.AuthStatus,
  };

  interface UseAuthStatus {
    (): UseAuthStatusDispatch
  }

  type UseAuthCheckDispatch = {
    authStatus: App.AuthStatus;
    check: App.EmptyCallback<App.EmptyCallback>;
  };

  interface AuthCheckListener {
    (status: App.AuthStatus): void;
  }

  type UseAuthCheckGenericDispatch = {
    check: App.EmptyCallback<App.EmptyCallback>;
  };

  interface UseAuthCheckGeneric {
    (unit: App.Unit, listener: AuthCheckListener): UseAuthCheckGenericDispatch
  }

  interface UseAuthCheck {
    (): UseAuthCheckDispatch
  }

  interface AuthContext {
    auth: App.AuthStatus;
  }

  type UseErrorsDispatch = {
    sendId: string | null;
    errorMessage: string | null;
  };

  interface UseErrors {
    (unit: App.Unit): UseErrorsDispatch
  }

  type UseIsHoveredDispatch = {
    isHovered: boolean;
  };

  interface UseIsHoveredConfig<T extends Element> {
    ref: Other.MutableRefObject<T>;
    ignore?: boolean | App.EmptyCallback<boolean>;
    onChange?(nextHoverState: boolean): void;
  }

  interface UseIsHovered {
    <T extends Element>(config: UseIsHoveredConfig<T>): UseIsHoveredDispatch
  }

  type UseForceUpdateDispatch = {
    update(): void;
    updateCount: number;
  };

  interface UseForceUpdate {
    (): UseForceUpdateDispatch;
  }

  interface UseHideDispatch {
    units(units: App.Unit[]): void;
  }

  interface UseHide {
    (): UseHideUnitsDispatch
  }

  interface UseUpdateDispatch {
    selection(selectionId: App.SettingsTab | 'save' | null): void;
  }

  interface UseUpdate {
    (): UseUpdateDispatch
  }

  interface UseSelectionDispatch {
    selection: App.SettingsTab | 'save' | null;
  }

  interface UseSelection {
    (): UseSelectionDispatch
  }

  interface UseSelectionRefDispatch {
    selectionRef: Other.MutableRefObject<HTMLDivElement> | null;
    updateSelectionRef(ref: Other.MutableRefObject<HTMLDivElement>): void;
  }

  interface UseSelectionRef {
    (): UseSelectionRefDispatch
  }
}