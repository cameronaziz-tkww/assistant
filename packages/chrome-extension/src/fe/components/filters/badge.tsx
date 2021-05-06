import React, { FunctionComponent } from 'react';
import * as Styled from './styled';

interface BadgeProps {
  counts: App.Filter.Counts
}

const Badge: FunctionComponent<BadgeProps> = (props) => {
  const { currentCount, total } = props.counts;

  return (
    <Styled.BadgeContainer
      isFiltered={currentCount !== total}
    >
      {currentCount}
    </Styled.BadgeContainer>
  );
};

export default Badge;
