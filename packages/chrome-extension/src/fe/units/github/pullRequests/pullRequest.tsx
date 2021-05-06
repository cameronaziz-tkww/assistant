import Card from '@components/card';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import { formatDistance } from 'date-fns';
import React, { forwardRef } from 'react';
import State from '../state';
import Labels from './labels';

interface PullRequestProps {
  pullRequest: App.Github.PullRequest;
}

const PullRequest = forwardRef<HTMLDivElement, PullRequestProps>((props, ref) => {
  const { pullRequest } = props;
  const { filterGroups } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();

  const { url, updatedAt, prNumber, owner, repository, createdBy, title } = pullRequest;

  const navigate = () => {
    window.location.href = url;
  };

  const assigneeGroup = filterGroups.find((filter) => filter.id === 'github-createdBy');
  const colors = assigneeGroup ? Object.values(assigneeGroup.filters).map((current) => ({
    full: current.filter.full,
    color: current.filter.color,
  })) : [];

  const filter = assigneeGroup && Object.values(assigneeGroup.filters).find((filter) => filter.filter.full === pullRequest.createdBy);

  const handleClickCreatedBy = () => {
    if (filter) {
      handle(filter);
    }
  };

  const color = colors.find((c) => c.full === pullRequest.createdBy)?.color;

  return (
    <Card
      ref={ref}
      title={{
        pill: true,
        text: `${owner}/${repository}/${prNumber}`,
        onClick: navigate,
      }}
      centerTitle={`Updated ${formatDistance(new Date(updatedAt), new Date())} ago`}
      endTitle={{
        text: createdBy,
        color,
        handleClick: handleClickCreatedBy,
      }}
      footer={<Labels pullRequest={pullRequest} />}
      endFooter={{
        text: <State pullRequest={pullRequest} />,
      }}
    >
      {title}
    </Card>
  );
});

export default PullRequest;
