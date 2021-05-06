import { mergeRefs, simulateEvent } from '@utils';
import React, { ButtonHTMLAttributes, forwardRef, PropsWithChildren, ReactNode, useEffect, useRef } from 'react';
import { IconType } from 'react-icons';
import * as Styled from './styled';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Styled.ContainerProps {
  clickOnEnter?: boolean;
  Icon?: IconType;
  label?: string | ReactNode;
}
const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>((props, ref) => {
  const { clickOnEnter, label, children, Icon, ...rest } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(
    () => {
      if (clickOnEnter) {
        window.addEventListener('keydown', keydown);
      }
      return () => {
        if (clickOnEnter) {
          window.removeEventListener('keydown', keydown);
        }
      };

    },
    [clickOnEnter],
  );

  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && props.onClick && buttonRef.current) {
      simulateEvent(buttonRef.current, 'click');
    }
  };

  return (
    <Styled.Container ref={mergeRefs([buttonRef, ref])} onlyIcon={!!Icon && !children} {...rest}>
      <Styled.IconContainer>
        {Icon && <Icon />}
      </Styled.IconContainer>
      {label || children}
    </Styled.Container>
  );
});

export default Button;
