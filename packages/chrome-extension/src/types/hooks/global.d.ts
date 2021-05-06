declare namespace Hooks {
  namespace History {
    type UseFeedDispatch = {
      init(): void
      feed: App.History.FeedItem[];
    };

    interface UseFeed {
      (): UseFeedDispatch
    }

    type UseDismissItemDispatch = {
      dismiss(itemId: string): void
    };

    interface UseDismissItem {
      (): UseDismissItemDispatch
    }
  }
}