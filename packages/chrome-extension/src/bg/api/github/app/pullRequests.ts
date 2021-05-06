import { graphql as GraphQLApp } from '@octokit/graphql/dist-types/types';
import { Reactor } from '@utils';
import * as builders from '../builders';
import * as queries from '../queries';

const baseCommitStatus: App.Github.PullRequestStatus = {
  state: 'FAILURE',
  contexts: [],
};

class PullRequestsAPI {
  private app: GraphQLApp;
  private reactor: Reactor<App.Github.Reactors>;

  constructor(app: GraphQLApp, reactor: Reactor<App.Github.Reactors>) {
    this.app = app;
    this.reactor = reactor;
  }

  fetchAll = async (id: string, config: API.Utilities.PullRequestsConfig[]): Promise<API.Github.PullRequest[]> => {
    if (!config) {
      return [];
    }
    const query = builders.pullRequests(config);
    const response = await this.app<API.Response.PullRequests>(query);

    return this.fetchMore(id, response, [], config);
  }

  fetchSingle = async (config: API.Utilities.PullRequestConfig): Promise<API.Github.UpdatePullRequest> => {
    const response = await this.app<API.Github.UpdatePullRequestQuery>(
      queries.pullRequest,
      {
        repositoryName: config.name,
        repositoryOwner: config.owner,
        pullRequestNumber: config.number,
      },
    );
    return response.repository.pullRequest;
  }

  private fetchMore = async (
    id: string,
    lastResponse: API.Response.PullRequests,
    current: API.Github.PullRequest[],
    pullRequestsConfig: API.Utilities.PullRequestsConfig[],
  ): Promise<API.Github.PullRequest[]> => {
    const repositories = this.parseResponse(lastResponse, pullRequestsConfig);
    const next = repositories
      .map((repository) => {
        const { nodes } = repository.pullRequests;
        const updates = nodes.map((node): API.Github.PullRequest => {
          const status = node.commits.nodes.pop()?.commit.status || baseCommitStatus;
          return {
            ...node,
            owner: repository.owner.login,
            repository: repository.name,
            labels: node.labels.nodes,
            reviews: node.latestOpinionatedReviews.nodes,
            status,
          };
        });

        current.push(...updates);
        return repository;
      })
      .filter((repository) => repository.pullRequests.pageInfo.hasNextPage)
      .map((repository): API.Utilities.PullRequestsConfig => ({
        endCursor: repository.pullRequests.pageInfo.endCursor,
        owner: repository.owner.login,
        name: repository.name,
        id: repository.id,
      }));

    if (next.length === 0) {
      return current;
    }

    const query = builders.pullRequests(next);

    const response = await this.app<API.Response.PullRequests>(
      query,
    );

    return this.fetchMore(id, response, current, next);
  };

  private parseResponse = (response: API.Response.PullRequests, keys: API.Utilities.PullRequestsConfig[]) => keys.map((key) => response[key.id.replace(/\=/g, '')]);
}

export default PullRequestsAPI;
