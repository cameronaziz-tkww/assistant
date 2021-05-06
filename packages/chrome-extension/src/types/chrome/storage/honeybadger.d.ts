declare namespace Storage {
  namespace Honeybadger {
    type All = Auth & Settings & {
      honeybadgerProjects: App.Honeybadger.Project[]
    }

    interface Auth {
      honeybadgerAuth: AuthStore;
    }

    interface Settings {
      honeybadgerSettings: SettingsStore;
    }

    interface AuthStore {
      key?: string;
    }

    interface SettingsStore {
      monitors: App.Honeybadger.Monitor[];
    }
  }
}