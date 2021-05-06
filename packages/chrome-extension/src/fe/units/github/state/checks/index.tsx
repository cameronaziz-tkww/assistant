import { github } from '@context';
import React, { FunctionComponent } from 'react';
import * as Styled from '../styled';
import Status from './status';

interface ChecksProps {
  pullRequest: App.Github.PullRequest;
}

const Checks: FunctionComponent<ChecksProps> = (props) => {
  const { status } = props.pullRequest;
  const { prConfig: { mostChecks } } = github.useTrackedState();

  const extra = Array.from({ length: mostChecks - status.contexts.length });

  return (
    <Styled.StateContainer>
      <Styled.StateLabel>
        Checks:
      </Styled.StateLabel>
      {status.contexts.map((status) =>
        <Status key={status.context} status={status} />,
      )}
      {extra.map((_, index) =>
        <Status key={index} isFake />,
      )}
    </Styled.StateContainer>
  );
};

export default Checks;
