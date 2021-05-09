import Badge from '@components/badge';
import Tooltip from '@components/tooltip';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface FilterProps<T extends App.Filter.Item> {
  current: App.Filter.FilterWrapper<T>;
  disableTooltip?: boolean;
}

const Filter = <T extends App.Filter.Item>(props: FilterProps<T>): ReactElement<FilterProps<T>> => {
  const { current, disableTooltip } = props;
  const { filter, groupId, counts } = current;
  const { currentFilters } = filtersContext.useTrackedState();
  const apply = filters.useApplyFilter();
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
    apply(groupId, current.filter.id);
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
        state={currentFilter?.state}
      >
        <Styled.Text ref={containerRef} scale={scale}>
          {filter.abbreviation}
        </Styled.Text>
        <Badge
          isWeak={counts.currentCount !== counts.total}
          label={counts.currentCount}
        />
      </Styled.FilterContainer>
    </Tooltip>
  );
};

export default Filter;
