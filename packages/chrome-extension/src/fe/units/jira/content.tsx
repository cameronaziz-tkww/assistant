import Filters from '@components/filters';
import Unit from '@components/unit';
import { filters } from '@context';
import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';
import filterConfigs from './filterConfigs';
import Issues from './issues';

const Content: FunctionComponent = () => {
  const { issues } = jira.useIssues();
  const { projects } = jira.useProjects();
  const settings = jira.useSettings(['filters']);

  const allOnlyActive = Object
    .values(projects.watches)
    .every((project) => project.filters.onlyActive);

  const useFilters = settings.filters
    .filter((filter) => {
      if (allOnlyActive) {
        return filter !== 'sprints';
      }
      return true;
    });

  return (
    <filters.Provider
      filterConfigs={filterConfigs(useFilters)}
      items={issues}
    >
      <Filters />
      <Unit.Content
        hasData={issues.length > 0}
        hideProgress={issues.length === 0}
      >
        <Issues />
      </Unit.Content>
    </filters.Provider>
  );

};

export default Content;
