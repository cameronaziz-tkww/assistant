declare namespace App {
  namespace Reactor {

    type FrontendEvent = 'filter';

    type Unit = 'jira' | 'github';

    type Events = {
      'partial-repository-list': PartialRepositoryList;
      'watched-updated': [];
      'filter': Hooks.Global.Event;
    }

    type StorageUpdated = {
      [K in keyof Storage.All]: [Storage.All[K]];
    }

    type EventNames = Events & StorageUpdated;

    type PartialRepositoryList = [
      id: string,
      repositories: API.Github.Repository[],
    ];
  }
}