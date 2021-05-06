declare namespace Chrome {
  namespace Tabs {

    type MutedInfoReason = MutedInfoReasonProperty[keyof MutedInfoReasonProperty];
    interface MutedInfoReasonProperty {
      CAPTURE: 'capture';
      EXTENSION: 'extension';
      USER: 'user';
    }

    type TabStatus = TabStatusProperty[keyof TabStatusProperty];
    interface TabStatusProperty {
      COMPLETE: 'complete';
      LOADING: 'loading';
      UNLOADED: 'unloaded';
    }

    type WindowType = WindowType[keyof WindowTypeProperty];
    interface WindowTypeProperty {
      APP: 'app';
      DEVTOOLS: 'devtools';
      NORMAL: 'normal';
      PANEL: 'panel';
      POPUP: 'popup';
    }

    type ZoomSettingsMode = ZoomSettingsMode[keyof ZoomSettingsModeProperty];
    interface ZoomSettingsModeProperty {
      AUTOMATIC: 'automatic';
      DISABLED: 'disabled';
      MANUAL: 'manual';
    }

    type ZoomSettingsScope = ZoomSettingsScope[keyof ZoomSettingsScopeProperty];
    interface ZoomSettingsScopeProperty {
      PER_ORIGIN: 'per-origin';
      PER_TAB: 'per-tab'
    }

    interface ConnectInfo {
      frameId?: number;
      name?: string;
    }

    interface QueryInfo {
      active?: boolean;
      audible?: boolean;
      autoDiscardable?: boolean;
      currentWindow?: boolean;
      discarded?: boolean;
      groupId?: number;
      highlighted?: boolean;
      index?: number;
      lastFocusedWindow?: boolean;
      muted?: boolean;
      pinned?: boolean;
      status?: TabStatus;
      title?: string;
      url?: string | string[];
      windowId?: number;
      windowType?: WindowType;
    }

    interface Query {
      (queryInfo: QueryInfo, callback: Utilities.Callback<Tab[]>): void;
    }

    interface MutedInfo {
      extensionId?: string;
      muted: boolean;
      reason: MutedInfoReason;
    }

    interface Tab {
      active: boolean;
      audible: boolean;
      autoDiscardable: boolean;
      discarded: boolean;
      favIconUrl?: string; //
      groupId: number;
      height?: number; //
      highlighted: boolean;
      id?: number; //
      incognito: boolean; //
      index: number;
      mutedInfo?: MutedInfo;
      openerTabId?: number;
      pendingUrl?: string;
      pinned: boolean;
      selected: boolean;
      sessionId?: string;
      status: TabStatus;
      title: string;
      url?: string | string[];
      width?: number;
      windowId: number;
    }

    interface ActiveInfo {
      tabId: number;
      windowId: number;
    }

    interface API {
      MutedInfoReason: MutedInfoReason;
      TAB_ID_NONE: number;
      TabStatus: TabStatus;
      WindowType: WindowType;
      ZoomSettingsMode: ZoomSettingsMode;
      ZoomSettingsScope: ZoomSettingsScope;
      captureVisibleTab(windowId?: number, options?: ExtensionTypes.ImageDetails): Promise<string>;
      connect(tabId: number, connectInfo: ConnectInfo): App.ShouldDefineType;
      create: App.UnknownFunction;
      detectLanguage: App.UnknownFunction;
      discard: App.UnknownFunction;
      duplicate: App.UnknownFunction;
      executeScript: App.UnknownFunction;
      get: App.UnknownFunction;
      getAllInWindow: App.UnknownFunction;
      getCurrent: App.UnknownFunction;
      // Deprecated
      getSelected: App.UnknownFunction;
      getZoom: App.UnknownFunction;
      getZoomSettings: App.UnknownFunction;
      goBack: App.UnknownFunction;
      goForward: App.UnknownFunction;
      group: App.UnknownFunction;
      highlight: App.UnknownFunction;
      insertCSS: App.UnknownFunction;
      move: App.UnknownFunction;
      onActivated: Chrome.Listener<ActiveInfo>;
      onActiveChanged: App.ShouldDefineType;
      onAttached: App.ShouldDefineType;
      onCreated: App.ShouldDefineType;
      onDetached: App.ShouldDefineType;
      onHighlightChanged: App.ShouldDefineType;
      onHighlighted: App.ShouldDefineType;
      onMoved: App.ShouldDefineType;
      onRemoved: App.ShouldDefineType;
      onReplaced: App.ShouldDefineType;
      onSelectionChanged: App.ShouldDefineType;
      onUpdated: App.ShouldDefineType;
      onZoomChange: App.ShouldDefineType;
      query: Query;
      reload: App.UnknownFunction;
      remove: App.UnknownFunction;
      removeCSS: App.UnknownFunction;
      sendMessage: App.UnknownFunction;
      sendRequest: App.UnknownFunction;
      setZoom: App.UnknownFunction;
      setZoomSettings: App.UnknownFunction;
      ungroup: App.UnknownFunction;
      update: App.UnknownFunction;
    }
  }
}
