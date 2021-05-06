import Pill from '@components/pill';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import React, { FunctionComponent } from 'react';

const NoLabels: FunctionComponent = () => {
  const { filterGroups } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();

  const labelsGroup = filterGroups.find((filter) => filter.id === 'github-labels');
  const filter = labelsGroup && Object.values(labelsGroup.filters).find((filter) => filter.filter.full === 'No Labels');

  const handleClick = () => {
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Pill
      onClick={handleClick}
      size="md"
      background="red"
      foreground="black"
    >
      No Labels
    </Pill>
  );
};

export default NoLabels;
