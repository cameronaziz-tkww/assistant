declare namespace API {
  namespace Methods {
    namespace Jira {
      interface FetchFilter {
        projectKey?: string;
        sprintId?: number;
      }

      interface FetchConfig {
        includeDone?: boolean;
        filters: FetchFilter[]
      }

      interface Fetch {
        (config: FetchConfig): Endpoint
      }

      interface CurrentUser {
        (): Endpoint
      }

      interface Meta {
        (): Endpoint
      }

      interface BoardsConfig {
        startAt: number;
      }

      interface Boards {
        (config: BoardsConfig): Endpoint
      }

      interface SprintsConfig {
        startAt: number;
        board: string | number;
      }

      interface Sprints {
        (config: SprintsConfig): Endpoint
      }
    }
  }
}
