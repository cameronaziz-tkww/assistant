declare namespace Runtime {
  namespace History {

    interface FeedFetch {
      type: 'history/FEED_FETCH';
      meta: SendMeta;
    }

    interface DismissFeedItem {
      type: 'history/DISMISS_FEED_ITEM';
      feedItemId: string;
      meta: SendMeta;
    }

    interface FeedResponse {
      type: 'history/FEED_RESPONSE';
      data: App.History.FeedItem[]
      meta: ResponseMeta
    }

    type Fetcher = FeedFetch;
    type Responses = FeedResponse;
    type Setter = DismissFeedItem;

    type Message =
      | Fetcher
      | Responses;
  }
}
