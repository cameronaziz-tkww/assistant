declare namespace App {
  namespace History {
    type ContextInit = 'feed';

    interface FeedItem {
      type: FeedItemType
      message: MessagePart[];
      id: string;
      createdAt: string;
      app: App;
    }

    type FeedItemType =
      | GithubFeedItemType
      | JiraFeedItemType;

    type GithubFeedItemType = 'merge' | 'close' | 'open' | 'release';
    type JiraFeedItemType = 'status' | 'assignee' | 'sprints';

    type MessagePart = Tile | string;
    type App = 'jira' | 'github';

    interface LevelColor {
      color: string;
    }

    type Level = Theme.ThemeColor | LevelColor;

    interface Tile {
      label: string;
      url?: string;
      level: Level;
      isFilterable?: boolean;
    }
  }
}