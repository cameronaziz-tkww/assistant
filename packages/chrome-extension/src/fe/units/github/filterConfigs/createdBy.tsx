import React from 'react';
import AuthorTooltip from '../authorTooltip';

const create: App.Filter.Create<App.Github.PullRequest> = (pullRequest, mapping): void => {
  const { createdBy, author, id } = pullRequest;
  if (!mapping[status]) {
    const abbreviation = createdBy
      .split('-')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();

    mapping[createdBy] = {
      id: createdBy,
      abbreviation,
      full: createdBy,
      tooltip: <AuthorTooltip author={author} />,
    };
  }
};

const run = (pullRequest: App.Github.PullRequest, id: string): boolean =>
  pullRequest.id === id;

export default {
  id: 'github-createdBy',
  label: 'Creator',
  run,
  create,
};
