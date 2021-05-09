import Badge from '@components/badge';
import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import { Immutable } from 'immer';
import React, { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import Filter from './filter';
import * as Styled from './styled';

interface FilterGroupProps<T extends App.Filter.Item> {
  filterGroup: Immutable<App.Filter.Group<T>>;
  isExpanded: boolean;
  isElementsVisible: boolean;
  showGroup(groupId: string): void;
  hideGroup(): void;
  handleExitComplete(): void;
}

function FilterGroup<T extends App.Filter.Item>(props: FilterGroupProps<T>): ReactElement<FilterGroupProps<T>> {
  const { filterGroup, handleExitComplete, isExpanded, isElementsVisible, showGroup, hideGroup } = props;
  const [defaultMaxWidth, setDefaultMaxWidth] = useState(0);
  const [defaultMaxHeight, setDefaultMaxHeight] = useState(0);
  const labelRef = useRef<HTMLDivElement>(null);
  const { currentFilters } = filtersContext.useTrackedState();
  const { filters: filterGroupFilters } = filters.useFilterGroupFilters(filterGroup.id);

  const appliedFilterCount = filterGroupFilters.filter((filter) => filter.state !== 'omit').length;

  useEffect(
    () => {
      if (labelRef.current && defaultMaxWidth === 0) {
        const { clientWidth, clientHeight } = labelRef.current;
        setDefaultMaxWidth(clientWidth + 8);
        setDefaultMaxHeight(clientHeight + 4);
      }
    },
    [labelRef.current],
  );

  const handleOpen = (event: MouseEvent<HTMLDivElement>) => {
    if (!isExpanded && event.target === event.currentTarget) {
      showGroup(filterGroup.id);
    }
  };

  const handleClose = () => {
    if (isExpanded) {
      hideGroup();
    }
  };

  return (
    <Styled.GroupWrapper>
      <CSSTransition
        in={isExpanded}
        timeout={1000}
        classNames="visible"
        onExited={handleExitComplete}
      >
        <Styled.GroupContainer
          defaultMaxWidth={defaultMaxWidth}
          defaultMaxHeight={defaultMaxHeight}
          filterCount={currentFilters.length}
        >
          <Styled.LabelWrapper
            ref={labelRef}
            isPointer={!isExpanded}
            onClick={handleOpen}
          >
            <Styled.Label onClick={handleOpen}>
              {filterGroup.label}
            </Styled.Label>
            {isExpanded &&
              <Styled.Close
                onClick={handleClose}
              >
                Close
              </Styled.Close>
            }
          </Styled.LabelWrapper>
          <Styled.FiltersContainer>
            {isElementsVisible && filterGroupFilters.map((filter) =>
              <Filter
                key={filter.filter.id}
                current={filter}
              />,
            )}
          </Styled.FiltersContainer>
        </Styled.GroupContainer>
      </CSSTransition>
      {!isExpanded && appliedFilterCount > 0 &&
        <Badge>
          {appliedFilterCount}
        </Badge>
      }
    </Styled.GroupWrapper>
  );
}

export default FilterGroup;
