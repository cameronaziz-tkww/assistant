import Tooltip from '@components/tooltip';
import { filters } from '@hooks';
import { capitalize } from '@utils';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';

interface StateProps {
  state: string;
  names: string[];
  issue: App.Jira.Issue;
}

const State: FunctionComponent<StateProps> = (props) => {
  const { state, issue, names } = props;
  const applyFilter = filters.useApplyFilter();

  const handleClick = () => {
    applyFilter('jira-sprint', issue.id);
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
