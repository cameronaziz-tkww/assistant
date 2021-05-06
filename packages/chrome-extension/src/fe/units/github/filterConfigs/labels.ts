const create = (pullRequest: App.Github.PullRequest, mapping: App.Filter.CreateMapping): void => {
  const { labels } = pullRequest;
  if (labels.length === 0) {
    const labelName = 'No Labels';
    if (!mapping[labelName]) {
      const filter: App.Filter.Filter = {
        id: 'No Labels',
        abbreviation: 'NL',
        full: 'No Labels',
        color: `#FF0000`,
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

      const filter: App.Filter.Filter = {
        id: labelName,
        abbreviation,
        full: labelName,
        color: `#${color}`,
      };

      mapping[labelName] = filter;
    }
  });
};

const run = (pullRequest: App.Github.PullRequest, full: string): boolean => {
  if (pullRequest.labels.length === 0 && full === 'No Labels') {
    return true;
  }
  return pullRequest.labels.findIndex((label) => label.name === full) > -1;
};

export default {
  id: 'github-labels',
  label: 'Label',
  run,
  create,
};
