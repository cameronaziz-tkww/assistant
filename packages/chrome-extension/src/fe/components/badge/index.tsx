import React, { FunctionComponent, ReactNode } from 'react';
import * as Styled from './styled';

interface BadgeProps {
  label?: ReactNode;
  isWeak?: boolean;
}

const Badge: FunctionComponent<BadgeProps> = (props) => {
  const { label, isWeak, children } = props;

  return (
    <Styled.BadgeContainer
      isWeak={isWeak}
    >
      {label || children}
    </Styled.BadgeContainer>
  );
};

export default Badge;
