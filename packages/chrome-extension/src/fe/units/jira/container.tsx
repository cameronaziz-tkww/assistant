import Unit from '@components/unit';
import { filters } from '@context';
import { jira } from '@hooks';
import React, { FunctionComponent } from 'react';
import filterConfigs from './filterConfigs';
import Wrapper from './wrapper';

const Container: FunctionComponent = () => {
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
    <Unit.Container
      rightMargin
      column="first"
    >
      <filters.Provider
        filterConfigs={filterConfigs(useFilters)}
        items={issues}
      >
        <Wrapper />
      </filters.Provider>
    </Unit.Container>
  );
};

export default Container;
