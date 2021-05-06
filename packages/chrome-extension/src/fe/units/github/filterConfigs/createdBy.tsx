import React from 'react';
import AuthorTooltip from '../authorTooltip';

const create = (pullRequest: App.Github.PullRequest, mapping: App.Filter.CreateMapping): void => {
  const { createdBy, author } = pullRequest;
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

const run = (pullRequest: App.Github.PullRequest, full: string): boolean =>
  pullRequest.createdBy === full;

export default {
  id: 'github-createdBy',
  label: 'Creator',
  run,
  create,
};
