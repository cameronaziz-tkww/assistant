import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import React, { ReactElement } from 'react';
import Filter from './filter';
import * as Styled from './styled';

interface FilterGroupProps<T extends App.Filter.Item> {
  filterGroup: App.Filter.CurrentFilterGroup<T>;
}

function FilterGroup<T extends App.Filter.Item>(props: FilterGroupProps<T>): ReactElement<FilterGroupProps<T>> {
  const { filterGroup } = props;
  const { currentFilters } = filtersContext.useTrackedState();
  const { handle } = filters.useClearFilters();
  const { filters: filterGroupFilters } = filters.useFilterGroupFilters(filterGroup.id);

  const hasFilters = currentFilters.filter((filter) => filter.state !== 'omit' && filter.groupId === filterGroup.id).length > 0;

  const handleClear = () => {
    if (hasFilters) {
      handle(filterGroup.id);
    }
  };

  return (
    <Styled.GroupContainer>
      <Styled.LabelWrapper>
        <Styled.Label>
          {filterGroup.label}
        </Styled.Label>
        <Styled.Clear
          onClick={handleClear}
          isHidden={!hasFilters}
        >
          Clear
        </Styled.Clear>
      </Styled.LabelWrapper>
      {filterGroupFilters.map((filter) =>
        <Filter
          key={filter.filter.id}
          current={filter}
        />,
      )}
    </Styled.GroupContainer>

  );
}

export default FilterGroup;
