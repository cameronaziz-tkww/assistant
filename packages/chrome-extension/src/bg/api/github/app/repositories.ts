import { graphql as GraphQLApp } from '@octokit/graphql/dist-types/types';
import { Reactor } from '@utils';
import * as builders from '../builders';

class RepositoriesAPI {
  private app: GraphQLApp;
  private reactor: Reactor<App.Github.Reactors>;

  constructor(app: GraphQLApp, reactor: Reactor<App.Github.Reactors>) {
    this.app = app;
    this.reactor = reactor;
  }

  fetch = async (id: string): Promise<API.Github.RepositoryFull[]> => {
    const query = builders.repositories({
      moreRepos: [],
    });
    const response = await this.app<API.Response.Repositories>(
      query,
      {
        noPersonal: false,
        noOrg: false,
      },
    );

    const data = await this.fetchMore(id, response, [], []);
    return data;
  }

  private fetchMore = async (
    id: string,
    lastResponse: API.Response.Repositories,
    current: API.Github.RepositoryFull[],
    moreRepos: API.Utilities.MoreRepo[],
  ): Promise<API.Github.RepositoryFull[]> => {
    this.reactor.dispatchEvent(
      'partial-repository-list',
      [
        id,
        current,
      ],
    );

    const { organizations, repositories } = lastResponse.viewer;
    const repos = this.parseRepositories(repositories);
    current.push(...repos.repos);

    const moreOrganizations = organizations ? this.parseOrgs(organizations.nodes, current) : [];
    const data = this.parseOrgData(lastResponse.viewer, moreRepos);
    const moreOrganization = this.parseOrgs(data, current);
    const moreOrgRepos = [...moreOrganization, ...moreOrganizations];

    if (repos.repos.length === 0 && moreOrgRepos.length === 0) {
      return current;
    }

    const query = builders.repositories({
      moreRepos: moreOrgRepos,
      personalEnd: repos.hasNextPage ? repos.endCursor : undefined,
    });

    const response = await this.app<API.Response.Repositories>(
      query,
      {
        noPersonal: !repos.hasNextPage,
        noOrg: true,
      },
    );

    return this.fetchMore(id, response, current, moreOrgRepos);
  };

  private parseOrgs = (orgs: API.DataStructure.Organization[], current: API.Github.RepositoryFull[]) =>
    orgs.map((node) => {
      current.push(...node.repositories.nodes);
      return node;
    })
      .filter((node) => node.repositories.pageInfo.hasNextPage)
      .map((org) => ({
        endCursor: org.repositories.pageInfo.endCursor,
        login: org.login,
      }));

  private parseOrgData = (viewer: API.DataStructure.Viewer, keys: API.Utilities.MoreRepo[]) =>
    keys.map((key) => viewer[key.login] as API.DataStructure.Organization)

  private parseRepositories = (repositories?: API.DataStructure.NodeList<API.Github.RepositoryFull>) => {
    if (!repositories) {
      return {
        hasNextPage: false,
        endCursor: undefined,
        repos: [] as API.Github.RepositoryFull[],
      };
    }

    const { pageInfo: { hasNextPage, endCursor }, nodes } = repositories;
    return {
      hasNextPage,
      endCursor,
      repos: nodes,
    };
  };
}

export default RepositoriesAPI;
