declare namespace App {
  namespace Honeybadger {
    type ContextInit = 'faults' | 'settings' | 'projects';

    interface Project {
      id: string;
      isWatched: boolean;
    }

    interface Monitor {
      timeAgo: App.TimeAgo;
      noticeLimit: number;
    }
  }
}