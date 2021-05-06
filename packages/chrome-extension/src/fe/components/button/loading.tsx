import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Button, { ButtonProps } from './basic';
import * as Styled from './styled';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const LoadingButton: FunctionComponent<LoadingButtonProps> = (props) => {
  const { isLoading, isDisabled, label, children, ...rest } = props;
  const [startWidth, setStartWidth] = useState(0);
  const standard = children || label;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(
    () => {
      if (isLoading && startWidth === 0) {
        setStartWidth(64);
        return;
      }

      if (buttonRef.current && !isLoading) {
        const width = buttonRef.current.clientWidth;
        setStartWidth(width);
      }

    },
    [isLoading, buttonRef],
  );

  return (
    <Button
      {...rest}
      ref={buttonRef}
      isDisabled={isLoading || isDisabled || rest.disabled}
      Icon={isLoading ? () => <Styled.Loading textWidth={startWidth} /> : undefined}
    >
      {isLoading ? null : standard}
    </Button>
  );
};

export default LoadingButton;
