import React, { FunctionComponent, HTMLAttributes } from 'react';
import * as Styled from './styled';

interface PillProps extends HTMLAttributes<HTMLDivElement>, Styled.ContainerProps {
  label?: string;
  onClose?(): void;
  opacity?: number;
}

const Pill: FunctionComponent<PillProps> = (props) => {
  const { label, size, children, onClose, ...rest } = props;

  return (
    <Styled.Container
      unselectable="on"
      size={size || 'md'}
      {...rest}
    >
      {label || children}
      {onClose &&
        <Styled.Close onClick={onClose} />
      }
    </Styled.Container>
  );
};

export default Pill;
