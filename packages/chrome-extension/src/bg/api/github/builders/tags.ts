
const builder = (configs: API.Utilities.HistoryConfig[]): string => {
  return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    releases(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      edges {
        node {
          author {
            login
          }
          id
          url
          tag {
            name
          }
          createdAt
          description
        }
      }
    } 
  }`,
  )}
}
`;
};

export default builder;
