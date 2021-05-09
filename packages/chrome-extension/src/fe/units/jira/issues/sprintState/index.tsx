import { NO_SPRINT } from '@units/jira/constants';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';
import State from './state';

interface SprintStateProps {
  issue: App.Jira.Issue;
}

interface Mapping {
  [state: string]: string[]
}

const SprintState: FunctionComponent<SprintStateProps> = (props) => {
  const { issue } = props;

  if (issue.sprints.length === 0) {
    return (
      <State issue={issue} state={NO_SPRINT} names={[]} />
    );
  }

  const states = issue.sprints
    .reduce(
      (acc, cur) => {
        if (!acc[cur.state]) {
          acc[cur.state] = [];
        }

        acc[cur.state].push(cur.name);

        return acc;
      },
      {} as Mapping,
    );

  return (
    <Styled.StateValuesContainer>
      {Object.entries(states).map(([state, names]) =>
        <State
          key={state}
          issue={issue}
          state={state}
          names={names}
        />,
      )}
    </Styled.StateValuesContainer>
  );
};

export default SprintState;
