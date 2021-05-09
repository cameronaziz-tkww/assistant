import React, { forwardRef, MouseEvent, PropsWithChildren, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface CheckboxProps {
  label?: string;
  isChecked?: boolean;
  handleClick?(nextValue: boolean): void;
  isDisabled?: boolean;
  capitalize?: boolean;
}

const Checkbox = forwardRef<HTMLDivElement, PropsWithChildren<CheckboxProps>>((props, ref) => {
  const { label, capitalize, children, isDisabled, handleClick, isChecked } = props;
  const [isCheckedLocal, setIsCheckedLocal] = useState<boolean>(isChecked || false);
  const containerRef = useRef<HTMLLabelElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(
    () => {
      if (isChecked !== isCheckedLocal) {
        setIsCheckedLocal(isChecked || false);
      }
    },
    [isChecked],
  );

  useEffect(
    () => {
      if (containerRef.current) {
        containerRef.current.addEventListener('mouseenter', mouseenter);
        containerRef.current.addEventListener('mouseleave', mouseout);
      }

      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('mouseenter', mouseenter);
          containerRef.current.removeEventListener('mouseleave', mouseout);
        }
      };
    },
    [containerRef],
  );

  const mouseenter = () => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  };

  const mouseout = () => {
    setIsHovered(false);
  };

  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDisabled) {
      if (handleClick) {
        handleClick(!isCheckedLocal);
      }
      setIsCheckedLocal(!isCheckedLocal);
    }
  };

  return (
    <Styled.Container
      isDisabled={isDisabled}
      ref={containerRef}
      isHovered={isHovered}
      hasLabel={!!label}
      onClick={onClick}
      isChecked={isCheckedLocal}
    >
      <Styled.Label
        ref={ref}
        capitalize={capitalize}
        isDisabled={isDisabled}
      >
        {label || children || ''}
      </Styled.Label>
      <Styled.Input
        isDisabled={isDisabled}
        type="checkbox"
      />
      <Styled.Checkmark
        isDisabled={isDisabled}
        isChecked={isCheckedLocal}
      />
    </Styled.Container>
  );
});

export default Checkbox;
