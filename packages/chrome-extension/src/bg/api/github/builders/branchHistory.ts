const builder = (configs: API.Utilities.HistoryConfig[]): string => {
  return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    refs(refPrefix: "refs/heads/", first: 100, orderBy: {field: TAG_COMMIT_DATE, direction: DESC}) {
      edges {
        node {
          name
        }
      }
    }
  }`,
  )}
}`;
};

export default builder;
