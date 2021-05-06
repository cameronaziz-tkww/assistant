declare namespace Chrome {
  namespace Identity {

    interface WebAuthFlowDetails {
      interactive?: boolean;
      url: stirng;
    }

    interface API {
      getRedirectURL(path: string): string;
      launchWebAuthFlow(details: WebAuthFlowDetails, callback: App.Callback<string>): void;
      launchWebAuthFlowPromise(details: WebAuthFlowDetails): Promise<string>;
      clearAllCachedAuthTokens(callback?: App.EmptyCallback): void;
    }
  }
}
