import { graphql as GraphQLApp } from '@octokit/graphql/dist-types/types';
import { Reactor } from '@utils';
import * as builders from '../builders';

class PullRequestsHistory {
  private app: GraphQLApp;
  private reactor: Reactor<App.Github.Reactors>;

  constructor(app: GraphQLApp, reactor: Reactor<App.Github.Reactors>) {
    this.app = app;
    this.reactor = reactor;
  }

  fetchAll = async (config: API.Utilities.HistoryConfig[]): Promise<API.Github.CleanHistoryPullRequest[]> => {
    const query = builders.pullRequestHistory(config);
    const response = await this.app<API.Response.History>(
      query,
      {
        repositoryName: 'test',
        repositoryOwner: 'cameronaziz',
      },
    );

    return Object.values(response)
      .reduce(
        (acc, cur) => {
          const pullRequests = cur.pullRequests.nodes.map((node): API.Github.CleanHistoryPullRequest => ({
            ...node,
            defaultBranchRef: cur.defaultBranchRef,
            owner: cur.owner,
            name: cur.name,
          }));
          acc.push(...pullRequests);
          return acc;
        },
        [] as API.Github.CleanHistoryPullRequest[],
      )
      .filter(
        (pullRequest) => pullRequest.baseRef?.id === pullRequest.defaultBranchRef.id,
      ).sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        if (aDate > bDate) {
          return -1;
        }
        if (aDate < bDate) {
          return 1;
        }
        return 0;
      });
  }
}

export default PullRequestsHistory;
