const query = `query($repositoryName: String!, $repositoryOwner: String!) {
  repository(name: $repositoryName, owner: $repositoryOwner) {
    pullRequests(first: 10, states: [MERGED, CLOSED]) {
      nodes {
        baseRef {
          id
        }
        labels {
          totalCount
        }
        mergedBy {
          avatarUrl
          login
        }
        number
        state
        title
      }
    }
    owner {
      login
    }
    name
    defaultBranchRef {
      id
    }
  }
}`;

export default query;
