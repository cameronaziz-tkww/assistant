import { filters } from '@hooks';
import React, { FunctionComponent } from 'react';
import type { IconType } from 'react-icons';
import * as Styled from '../styled';

interface StatusProps {
  issue: App.Jira.Issue;
}

type State = 'ok' | 'wip' | 'stale' | 'needs-attention';

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
  '10823': 'stale', // Unprioritized
  '10010': 'stale', // To Do
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
    case 'stale': return {
      color: 'grey-light',
      icon: Styled.StaleIcon,
    };
    default: return {
      color: 'white',
      icon: Styled.UnknownIcon,
    };
  }
};

const Status: FunctionComponent<StatusProps> = (props) => {
  const { issue } = props;
  const applyFilter = filters.useApplyFilter();

  const icon = getIcon(issue.status);

  const handleClick = () => {
    applyFilter('jira-status', issue.id);
  };

  return (
    <Styled.Container onClick={handleClick} appColor={icon.color}>
      <icon.icon />
      <Styled.StatusName>
        {issue.status.name}
      </Styled.StatusName>
    </Styled.Container>
  );
};

export default Status;
