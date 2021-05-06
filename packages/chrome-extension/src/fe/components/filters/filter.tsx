import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Tooltip from '../tooltip';
import Badge from './badge';
import * as Styled from './styled';

interface FilterProps {
  current: App.Filter.FilterItem<App.ShouldDefineType>;
  disableTooltip?: boolean;
}

const Filter: FunctionComponent<FilterProps> = (props) => {
  const { current, disableTooltip } = props;
  const { filter, groupId, counts } = current;
  const { currentFilters } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(
    () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        if (clientWidth > 22) {
          setScale(22 / clientWidth);
        }
      }
    },
    [containerRef],
  );

  const onClick = () => {
    handle(current);
  };

  const currentFilter = currentFilters.find((currentFilter) =>
    currentFilter.filter.id === filter.id &&
    currentFilter.groupId === groupId,
  );

  return (
    <Tooltip
      appColor={filter.color}
      key={filter.id}
      capitalize={filter.capitalize}
      text={filter.full}
      isDisabled={disableTooltip}
      noDelay
    >
      <Styled.FilterContainer
        count={counts.currentCount}
        color={filter.color}
        onClick={onClick}
      >
        <Styled.Text ref={containerRef} scale={scale}>
          {filter.abbreviation}
        </Styled.Text>
        {currentFilter?.state === 'include' &&
          <Styled.Checkmark />
        }
        {currentFilter?.state === 'exclude' &&
          <Styled.Cross />
        }
        {counts.currentCount > 0 && <Badge counts={counts} />}
      </Styled.FilterContainer>
    </Tooltip>
  );
};

export default Filter;
