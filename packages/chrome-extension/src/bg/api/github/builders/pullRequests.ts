import { pageInfoFields } from '../fragments';

const builder = (configs: API.Utilities.PullRequestsConfig[]): string => {
  return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    name
    owner {
      login
    }
    id
    pullRequests(first: 10, states: OPEN${typeof config.endCursor === 'undefined' ?
      '' :
      `, after: "${config.endCursor}"`
    }, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        id
        commits(first: 100) {
          nodes {
            commit {
              status {
                state
                contexts {
                  context
                  targetUrl
                  description
                  state
                }
              }
              message
              messageBody
            }
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
        url
        checksResourcePath
        checksUrl
        number
        state
        updatedAt
        author {
          avatarUrl(size: 10)
          login
        }
        title
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
        latestOpinionatedReviews(first: 5) {
          nodes {
            state
            author {
              login
              avatarUrl
            }
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
      }
      pageInfo {
        ...pageInfoFields
      }
      totalCount
    }
  }`,
  )}
}
  ${pageInfoFields}
`;
};

export default builder;
