
import { filters as filtersContext } from '@context';
import React, { FunctionComponent, useState } from 'react';
import FilterGroup from './group';
import * as Styled from './styled';

const Filters: FunctionComponent = () => {
  const { filterGroups } = filtersContext.useTrackedState();
  const [groupVisible, setGroupVisible] = useState<string | null>();
  const [groupElementsVisible, setGroupElementsVisible] = useState<string | null>();
  const [pendingGroupVisible, setPendingGroupVisible] = useState<string | null>();

  const groups = filterGroups.filter((group) => Object.keys(group.filters).length > 0);

  const showGroup = (groupId: string) => {
    if (!groupVisible) {
      setGroupVisible(groupId);
      setGroupElementsVisible(groupId);
      return;
    }
    setPendingGroupVisible(groupId);
    setGroupVisible(null);
  };

  const hideGroup = () => {
    setGroupVisible(null);
    setPendingGroupVisible(null);
  };

  const handleExitComplete = () => {
    if (pendingGroupVisible) {
      setGroupVisible(pendingGroupVisible);
      setGroupElementsVisible(pendingGroupVisible);
      setPendingGroupVisible(null);
      return;
    }
    setGroupElementsVisible(null);
  };

  return (
    <Styled.Container>
      {groups.map((group) =>
        <FilterGroup
          isExpanded={groupVisible === group.id}
          isElementsVisible={groupElementsVisible === group.id}
          key={group.id}
          handleExitComplete={handleExitComplete}
          filterGroup={group}
          hideGroup={hideGroup}
          showGroup={showGroup}
        />,
      )}
    </Styled.Container>
  );
};

export default Filters;
