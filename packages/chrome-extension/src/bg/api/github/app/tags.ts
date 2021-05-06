import { graphql as GraphQLApp } from '@octokit/graphql/dist-types/types';
import { Reactor } from '@utils';
import * as builders from '../builders';

class TagsAPI {
  private app: GraphQLApp;
  private reactor: Reactor<App.Github.Reactors>;

  constructor(app: GraphQLApp, reactor: Reactor<App.Github.Reactors>) {
    this.app = app;
    this.reactor = reactor;
  }

  fetch = async (config: API.Utilities.TagConfig[]): Promise<App.ShouldDefineType> => {
    if (!config) {
      return [];
    }
    const query = builders.tags(config);
    const response = await this.app<API.Response.PullRequests>(query);
    return response;
  }
}

export default TagsAPI;
