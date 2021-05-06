declare global {
  interface ContextState<T = App.ShouldDefineType> {
    current: T;
    history: T[];
  }

  interface FiltersContext {
    [uuid: string]: ContextState;
  }
  interface Window {
    jiraContext?: ContextState;
    githubContext?: ContextState;
    filtersContext?: FiltersContext;
  }
}

export { };
