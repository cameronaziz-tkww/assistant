import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface ProgressProps {
  percent: number;
  hide?: boolean;
}

const Progress: FunctionComponent<ProgressProps> = (props) => {
  const { percent, hide } = props;

  if (hide) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.Bar
        percent={percent}
      />
    </Styled.Container>
  );
};

export default Progress;
