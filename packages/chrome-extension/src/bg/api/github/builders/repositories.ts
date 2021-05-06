import { organizationFields, pageInfoFields, repositoryFields } from '../fragments';
import organizations from './organizations';

const builder = (config: API.Utilities.RepositoriesConfig): string => {
  const { moreRepos, personalEnd } = config;

  const organizationFragment = moreRepos.length > 0 ? organizations(moreRepos) : '';

  return `query($noPersonal: Boolean!, $noOrg: Boolean!) {
    viewer {
      login
      repositories(first: 100${typeof personalEnd === 'undefined' ?
      '' :
      `, after: "${personalEnd}"`
    }) @skip(if: $noPersonal) {
        totalCount
        nodes {
          ...repositoryFields
        }
        pageInfo {
          ...pageInfoFields
        }
      }
      ${moreRepos.map((repo) =>
      `     ${repo.login}: organization(login: "${repo.login}") {
        ...${repo.login}Fields
      }`)}
      organizations(first: 10) @skip(if: $noOrg) {
        totalCount
        nodes {
          ...organizationFields
        }
        pageInfo {
          ...pageInfoFields
        }
      }
    }
  }

  ${repositoryFields}
  ${pageInfoFields}
  ${organizationFields}
  ${organizationFragment}
`;
};

export default builder;
