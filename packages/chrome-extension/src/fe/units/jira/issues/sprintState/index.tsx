import { NO_SPRINT } from '@units/jira/constants';
import React, { FunctionComponent } from 'react';
import * as Styled from '../../styled';
import State from './state';

interface SprintStateProps {
  sprints: App.Jira.Sprint[]
}

interface Mapping {
  [state: string]: string[]
}

const SprintState: FunctionComponent<SprintStateProps> = (props) => {
  const { sprints } = props;

  if (sprints.length === 0) {
    return (
      <State state={NO_SPRINT} names={[]} />
    );
  }

  const states = sprints
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
        <State key={state} state={state} names={names} />,
      )}
    </Styled.StateValuesContainer>
  );
};

export default SprintState;
