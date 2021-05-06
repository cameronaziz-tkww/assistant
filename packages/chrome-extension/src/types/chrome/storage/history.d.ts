declare namespace Storage {
  namespace History {
    type All = OnlyArrays;

    type OnlyArrays = {
      historyFeed: HistoryFeed;
    }

    interface HistoryFeed {
      feed: App.History.FeedItem[]
    }
  }
}