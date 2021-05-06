import { filters as filtersContext } from '@context';
import { filters } from '@hooks';
import React, { FunctionComponent } from 'react';
import type { IconType } from 'react-icons';
import * as Styled from '../styled';

interface StatusProps {
  status: App.Jira.SimpleStatus;
}

type State = 'ok' | 'wip' | 'needs-attention';

interface Icon {
  icon: IconType;
  color: App.Theme.BaseColor;
}

interface StatusState {
  [code: string]: State;
}

const statusState: StatusState = {
  '10824': 'ok', // Verified on QA
  '10820': 'ok', // Ready for Deployment
  '3': 'ok', // In Progress
  '10203': 'wip', // Code Review
  '10823': 'wip', // Unprioritized
  '10825': 'wip', // Ready for QA
  '10817': 'needs-attention', // Rejected
  '10205': 'needs-attention', // In QA
  '10009': 'ok', // Done
};

const getIcon = (status: App.Jira.SimpleStatus): Icon => {
  switch (statusState[status.id]) {
    case 'ok': return {
      color: 'green',
      icon: Styled.SuccessIcon,
    };
    case 'wip': return {
      color: 'yellow',
      icon: Styled.WarningIcon,
    };
    case 'needs-attention': return {
      color: 'red',
      icon: Styled.ErrorIcon,
    };
    default: return {
      color: 'white',
      icon: Styled.UnknownIcon,
    };
  }
};

const Status: FunctionComponent<StatusProps> = (props) => {
  const { status } = props;
  const { filterGroups } = filtersContext.useTrackedState();
  const { handle } = filters.useClickFilter();
  const assigneeGroup = filterGroups.find((filter) => filter.id === 'jira-status');
  const filter = assigneeGroup && Object.values(assigneeGroup.filters).find((filter) => filter.filter.full === status.name);

  const icon = getIcon(status);

  const handleClick = () => {
    if (filter) {
      handle(filter);
    }
  };

  return (
    <Styled.Container onClick={handleClick} appColor={icon.color}>
      <icon.icon />
      <Styled.StatusName>
        {status.name}
      </Styled.StatusName>
    </Styled.Container>
  );
};

export default Status;
