const fragment = `fragment organizationFields on Organization {
  login
  repositories(first: 100) {
    totalCount
    nodes {
      ...repositoryFields
    }
    pageInfo {
      ...pageInfoFields
    }
  }
}`;

export default fragment;
