
const query = `query($repositoryName: String!, $repositoryOwner: String!, $pullRequestNumber: Int!) {
  repository(name: $repositoryName, owner: $repositoryOwner) {
    pullRequest(number: $pullRequestNumber) {
      merged
      closed
    }
  }
}`;

export default query;
