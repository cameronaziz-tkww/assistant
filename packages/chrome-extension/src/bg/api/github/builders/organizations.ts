const base = (config?: API.Utilities.MoreRepo) => `fragment ${config ? `${config.login}Fields` : 'organizationFields'} on Organization {
  login
  repositories(first: 100${config ? `, after: "${config.endCursor}"` : ''}) {
    totalCount
    nodes {
      ...repositoryFields
    }
    pageInfo {
      ...pageInfoFields
    }
  }
}`;

const builder = (after?: API.Utilities.MoreRepo[]): string => {
  if (!after) {
    return '';
  }

  return after.map((config) => `${base(config)}`).join('\n');
};

export default builder;
