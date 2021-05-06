import Tooltip from '@components/tooltip';
import { filters } from '@hooks';
import { capitalize } from '@utils';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';

interface StateProps {
  state: string;
  names: string[];
}

const State: FunctionComponent<StateProps> = (props) => {
  const { state, names } = props;
  const { handle } = filters.useClickFilter();
  const { groups } = filters.useFilterGroups();
  const stateGroup = groups.find((filter) => filter.id === 'jira-sprint');
  const filter = stateGroup && Object.values(stateGroup.filters).find((filter) => filter.filter.full.toUpperCase() === state.toUpperCase());

  const handleClick = () => {
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Tooltip text={names} isDisabled={names.length === 0}>
      <Styled.StateContainer
        onClick={handleClick}
        isError={names.length === 0}
        isRed={names.length === 0}
        isGreen={state === 'active'}
        isYellow={state === 'closed'}
      >
        {capitalize(state)}
      </Styled.StateContainer>
    </Tooltip>
  );
};

export default State;
