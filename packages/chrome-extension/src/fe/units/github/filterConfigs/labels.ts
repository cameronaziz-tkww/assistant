const create: App.Filter.Create<App.Github.PullRequest> = (pullRequest, mapping): void => {
  const { labels } = pullRequest;
  if (labels.length === 0) {
    const labelName = 'No Labels';
    if (!mapping[labelName]) {
      const filter: App.Filter.Filter<App.Github.PullRequest> = {
        id: 'No Labels',
        abbreviation: 'NL',
        full: 'No Labels',
        color: '#FF0000',
      };

      mapping[labelName] = filter;
    }
    return;
  }
  labels.forEach(({ name: labelName, color }) => {
    if (!mapping[labelName]) {
      const abbreviation = labelName
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase();

      const filter: App.Filter.Filter<App.Github.PullRequest> = {
        id: labelName,
        abbreviation,
        full: labelName,
        color: `#${color}`,
      };

      mapping[labelName] = filter;
    }
  });
};

const run = (pullRequest: App.Github.PullRequest, id: string): boolean => {
  if (pullRequest.labels.length === 0 && id === 'No Labels') {
    return true;
  }
  return pullRequest.labels.findIndex((label) => label.name === id) > -1;
};

export default {
  id: 'github-labels',
  label: 'Label',
  run,
  create,
};
