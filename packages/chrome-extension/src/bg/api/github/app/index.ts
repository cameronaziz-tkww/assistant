import { createTokenAuth } from '@octokit/auth-token';
import { graphql } from '@octokit/graphql';
import { graphql as GraphQLApp } from '@octokit/graphql/dist-types/types';
import { Reactor } from '@utils';
import PullRequests from './pullRequests';
import PullRequestsHistory from './pullRequestsHistory';
import Repositories from './repositories';
import Tags from './tags';

class APIApp {
  private app: GraphQLApp;
  private repositories: Repositories;
  private pullRequests: PullRequests;
  private tags: Tags;
  private pullRequestsHistory: PullRequestsHistory;

  constructor(key: string, reactor: Reactor<App.Github.Reactors>) {
    const auth = createTokenAuth(key);
    this.app = graphql.defaults({
      request: {
        hook: auth.hook,
      },
    });
    this.tags = new Tags(this.app, reactor);
    this.pullRequestsHistory = new PullRequestsHistory(this.app, reactor);
    this.repositories = new Repositories(this.app, reactor);
    this.pullRequests = new PullRequests(this.app, reactor);
  }

  fetchRepositories = async (): Promise<API.Github.RepositoryFull[]> => this.repositories.fetch();
  fetchPullRequests = async (id: string, config: API.Utilities.PullRequestsConfig[]): Promise<API.Github.PullRequest[]> => this.pullRequests.fetchAll(id, config);
  fetchPullRequest = async (config: API.Utilities.PullRequestConfig): Promise<API.Github.UpdatePullRequest> => this.pullRequests.fetchSingle(config);
  fetchPullRequestsHistory = async (config: API.Utilities.HistoryConfig[]): Promise<API.Github.CleanHistoryPullRequest[]> => this.pullRequestsHistory.fetchAll(config);
  fetchTags = async (config: API.Utilities.TagConfig[]): Promise<App.ShouldDefineType> => this.tags.fetch(config);
}

export default APIApp;
