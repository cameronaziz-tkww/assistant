const fragment = `fragment repositoryFields on Repository {
  id
  url
  name
  owner {
    login
  }
  description
  descriptionHTML
  defaultBranchRef {
    name
  }
}`;

export default fragment;
