import { filters, global, jira } from '@hooks';
import React, { Fragment, FunctionComponent, useEffect } from 'react';
import Issue from './issue';

const Issues: FunctionComponent = () => {
  const { listen } = global.useListenEvents('jira');
  const { issues } = jira.useFilteredIssues();
  const { find } = filters.useGetFilter<App.Jira.Issue>();
  const { handle } = filters.useClickFilter<App.Jira.Issue>();

  useEffect(
    () => {
      listen('filter', callback);
    },
    [],
  );

  const callback = (event: Hooks.Global.Event) => {
    const filter = find(event);
    if (filter) {
      handle(filter.filter.id, filter.groupId);
    }
  };

  return (
    <Fragment>
      {issues.map((issue) => (
        <Issue
          key={issue.key}
          issue={issue}
        />
      ))}
    </Fragment>
  );
};

export default Issues;
