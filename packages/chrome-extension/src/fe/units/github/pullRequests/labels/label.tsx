import Pill from '@components/pill';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import { lightOrDark } from '@utils';
import React, { FunctionComponent } from 'react';

interface LabelProps {
  label: App.Github.Label
}

const Label: FunctionComponent<LabelProps> = (props) => {
  const { label } = props;
  const { filterGroups } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();
  const labelsGroup = filterGroups.find((filter) => filter.id === 'github-labels');

  const filter = labelsGroup && Object.values(labelsGroup.filters).find((filter) => filter.filter.full === label.name);

  const handleClick = () => {
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Pill
      onClick={handleClick}
      size="sm"
      key={label.name}
      overrideBackground={`#${label.color}`}
      isLight
      foreground={lightOrDark(`#${label.color}`) ? 'black' : 'white'}
    >
      {label.name}
    </Pill>
  );
};

export default Label;
