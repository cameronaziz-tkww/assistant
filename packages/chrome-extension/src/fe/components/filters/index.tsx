
import { filters as filtersContext } from '@context';
import React, { FunctionComponent } from 'react';
import FilterGroup from './group';
import * as Styled from './styled';

const Filters: FunctionComponent = () => {
  const { filterGroups } = filtersContext.useTrackedState();

  const groups = filterGroups.filter((group) => Object.keys(group.filters).length > 0);

  return (
    <Styled.Container>
      {groups.map((group) =>
        <FilterGroup key={group.label} filterGroup={group} />,
      )}
    </Styled.Container>
  );
};

export default Filters;
