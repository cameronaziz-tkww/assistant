import { filters, global } from '@hooks';
import React, { Fragment, FunctionComponent, useEffect } from 'react';
import PullRequest from './pullRequest';

const PullRequests: FunctionComponent = () => {
  const { listen } = global.useListenEvents('github');
  const { filteredItems } = filters.useItems<App.Github.PullRequest>();
  const { find } = filters.useGetFilter<App.Github.PullRequest>();
  const { handle } = filters.useClickFilter<App.Github.PullRequest>();

  useEffect(
    () => {
      listen('filter', callback);
    },
    [],
  );

  const callback = (event: Hooks.Global.Event) => {
    const filter = find(event);
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Fragment>
      {filteredItems.map((pullRequest) =>
        <PullRequest
          key={pullRequest.prNumber}
          pullRequest={pullRequest}
        />,
      )}
    </Fragment>
  );
};

export default PullRequests;
