import Card from '@components/card';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import { formatDistance } from 'date-fns';
import React, { forwardRef } from 'react';
import SprintState from './sprintState';
import Status from './status';

interface IssueProps {
  issue: App.Jira.Issue;
}

const Issue = forwardRef<HTMLDivElement, IssueProps>((props, ref) => {
  const { issue } = props;
  const { filterGroups } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();
  const link = `${issue.appUrl}/browse/${issue.key}`;
  const issueAssignee = issue.assignee || 'Unassigned';
  const navigate = () => {
    window.location.href = link;
  };

  const assigneeGroup = filterGroups.find((filter) => filter.id === 'jira-assignee');
  const filter = assigneeGroup && Object.values(assigneeGroup.filters).find((filter) => filter.filter.full === issue.assignee);
  const colors = assigneeGroup ? Object.values(assigneeGroup.filters).map((current) => ({
    full: current.filter.full,
    color: current.filter.color,
  })) : [];

  const color = colors.find((c) => c.full === issueAssignee)?.color;

  const handleClick = () => {
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Card
      ref={ref}
      title={{
        pill: true,
        text: issue.key,
        onClick: navigate,
      }}
      centerTitle={`Created ${formatDistance(new Date(issue.createdAt), new Date())} ago`}
      endTitle={{
        text: issueAssignee,
        color,
        handleClick: handleClick,
      }}
      footer={<Status status={issue.status} />}
      endFooter={{
        text: <SprintState sprints={issue.sprints} />,
      }}
    >
      {issue.summary}
    </Card>
  );
});

export default Issue;
