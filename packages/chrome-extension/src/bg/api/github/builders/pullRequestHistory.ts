import { pageInfoFields } from '../fragments';

const builder = (configs: API.Utilities.HistoryConfig[]): string => {
  return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    pullRequests(first: 100${typeof config.endCursor === 'undefined' ?
      '' :
      `, after: "${config.endCursor}"`
    }, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        author {
          login
        }
        createdAt
        baseRef {
          id
        }
        labels(first: 10) {
          nodes {
            color
            name
            description
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
        mergedBy {
          avatarUrl
          login
        }
        number
        state
        title
        url
      }
    }
    owner {
      login
    }
    name
    defaultBranchRef {
      id
    }
  }`,
  )}
}
  ${pageInfoFields}
`;
};

export default builder;
