declare namespace Hooks {
  namespace Honeybadger {
    interface UseFaultsDispatch {
      faults: unknwon[];
    }

    interface UseFaults {
      (): UseFaultsDispatch
    }

    interface UseMonitorsDispatch {
      monitors: App.Honeybadger.Monitor[];
      updateMonitor(monitor: App.Honeybadger.Monitor, nextAddState: boolean): void;
    }

    interface UseMonitors {
      (): UseMonitorsDispatch
    }

    interface UseProjectsDispatch {
      watchedProjects: App.Honeybadger.Project[];
      allProjects: App.Honeybadger.Project[];
      updateProjects(id: string, nextWatchedState: boolean): void;
    }

    interface UsePrjects {
      (): UseProjectsDispatch
    }

  }
}