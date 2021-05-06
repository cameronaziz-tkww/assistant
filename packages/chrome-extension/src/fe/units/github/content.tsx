import Filters from '@components/filters';
import Unit from '@components/unit';
import { filters } from '@context';
import { github } from '@hooks';
import React, { FunctionComponent } from 'react';
import filterConfigs from './filterConfigs';
import PullRequests from './pullRequests';

const Content: FunctionComponent = () => {
  const { pullRequests } = github.usePullRequests();

  return (
    <filters.Provider
      filterConfigs={filterConfigs(['createdBy', 'labels', 'status'])}
      items={pullRequests}
    >
      <Filters />
      <Unit.Content
        hasData={pullRequests.length > 0}
        hideProgress={pullRequests.length === 0}
      >
        <PullRequests />
      </Unit.Content>
    </filters.Provider>
  );

};

export default Content;
