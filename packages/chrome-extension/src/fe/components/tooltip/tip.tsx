import { useIsHovered } from '@hooks';
import { theme } from '@utils';
import React, { FunctionComponent, MouseEvent, ReactNode, useRef } from 'react';
import { ThemeProvider } from 'styled-components';
import * as Styled from './styled';

interface TipProps extends Styled.TooltipTextProps, Styled.ContainerProps, Styled.StyledTooltipProps {
  text: string | ReactNode;
  isDisabled?: boolean;
  noDelay?: boolean;
  onClick?(event: MouseEvent<HTMLDivElement>): void;
  handleHover: App.Callback<boolean>;
  isNotHovered: boolean;
}

const Tip: FunctionComponent<TipProps> = (props) => {
  const { text, isNotHovered, onClick, handleHover, capitalize, ...rest } = props;
  const tooltipText = typeof text === 'string' ? text.split('\n)').join('<br />') : text;
  const ref = useRef<HTMLDivElement>(null);
  useIsHovered({ ref, onChange: handleHover });

  if (isNotHovered) {
    return null;
  }

  return (
    <ThemeProvider theme={{
      ...theme,
      windowHeight: 1000,
    }}>
      <Styled.StyledTooltip
        ref={ref}
        {...rest}
      >
        <Styled.TooltipText capitalize={capitalize} onClick={onClick}>
          {tooltipText}
        </Styled.TooltipText>
      </Styled.StyledTooltip>
    </ThemeProvider>
  );
};

export default Tip;
