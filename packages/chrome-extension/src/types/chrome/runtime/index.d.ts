declare namespace Runtime {
  type MessageType = Message['type'];

  interface ResponseMeta {
    done: boolean;
    id: string;
  }

  interface SendMeta {
    id: string;
  }

  type Responses =
    | Github.Responses
    | History.Responses
    | Jira.Responses
    | Honeybadger.Responses
    | Error.Message
    | StorageOn
    | StorageOnce;

  type Fetcher =
    | Github.Fetcher
    | Honeybadger.Fetcher
    | History.Fetcher
    | Jenkins.Fetcher
    | StorageGet
    | Jira.Fetcher;

  type Setter =
    | Github.Setter
    | Honeybadger.Setter
    | History.Setter
    | Jira.Setter
    | StorageSet;

  type Message =
    | Responses
    | Setter
    | Fetcher
    | Error.Message
    | StartLoading
    | StopLoading;

  type IsAuthenticated =
    | Github.IsAuthenticated
    | Jira.IsAuthenticated;

  type MessageWithMeta<T> = T & {
    meta: ResponseMeta
  }
}
