declare namespace Chrome {

  interface MessageListener<T> {
    (message: T): void;
  }

  interface Listener {
    addListener<T>(listener: MessageListener<T>): void;
    dispatch: App.ShouldDefineType
    hasListener<T>(listener: MessageListener<T>): boolean;
    hasListeners<T>(listeners: MessageListener<T>[]): boolean;
    removeListener<T>(listener: MessageListener<T>): void;
  }

  interface Instance {
    app: App.ShouldDefineType;
    csi: App.ShouldDefineType;
    dom: App.ShouldDefineType;
    extension: App.ShouldDefineType;
    i18n: App.ShouldDefineType;
    identity: Identity.API;
    loadTimes: App.ShouldDefineType;
    management: App.ShouldDefineType;
    permissions: App.ShouldDefineType;
    runtime: Runtime.API;
    storage: Storage.API;
    tabs: Tabs.API;
    windows: App.ShouldDefineType;
  }
}