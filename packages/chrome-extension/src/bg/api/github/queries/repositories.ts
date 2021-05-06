import { repositoryFields, pageInfoFields } from '../fragments';

const query = `query($noPersonal: Boolean!, $noOrg: Boolean!) {
  viewer {
    login
    repositories(first: 100) @skip(if: $noPersonal) {
      totalCount
      nodes {
        ...repositoryFields
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    organizations(first: 10) @skip(if: $noOrg) {
      totalCount
      nodes {
        login
        repositories(first: 100) {
          totalCount
          nodes {
            ...repositoryFields
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}

${repositoryFields}
${pageInfoFields}`;

export default query;
