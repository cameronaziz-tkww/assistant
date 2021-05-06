import { getRGBA, isBaseColor, isThemeColor } from '@utils';
import { AiFillInfoCircle, AiFillWarning } from 'react-icons/ai';
import styled, { PropsWithTheme } from 'styled-components';

export const InfoIcon = styled(AiFillInfoCircle)`
  display: inline-block;
  color: ${({ theme }) => theme.baseColors['blue-light']};
`;

export const ErrorIcon = styled(AiFillWarning)`
  display: inline-block;
  color: ${({ theme }) => theme.baseColors['red-light']};
`;

export interface TooltipTextProps {
  capitalize?: boolean;
}

type CursorType = 'default' | 'pointer' | 'help'

export interface ContainerProps {
  truncate?: boolean;
  cursorType?: CursorType;
  inline?: boolean;
  marginY?: boolean;
}

export interface StyledTooltipProps {
  size?: App.Theme.Size;
  nowrap?: boolean;
  pre?: boolean;
  appColor?: App.Theme.BaseColor | App.Theme.ThemeColor | string;
}

const whiteSpace = (props: StyledTooltipProps): string => {
  if (props.nowrap) {
    return 'nowrap';
  }

  if (props.pre) {
    return 'pre';
  }

  return 'inherit';
};

export const TooltipText = styled.div<TooltipTextProps>`
  text-align: center;
  text-transform: ${(props) => props.capitalize ? 'capitalize' : 'inherit'};
`;

export const Container = styled.div<ContainerProps>`
  display: ${({ inline }) => inline ? 'inline-block' : 'inherit'};
  margin: 0 ${({ marginY, theme }) => marginY ? theme.sizes.md.marginY : 'inherit'};
  text-overflow: ${(props) => props.truncate ? 'ellipsis' : 'inherit'};
  overflow: ${(props) => props.truncate ? 'hidden' : 'inherit'};
  min-width: ${(props) => props.truncate ? '0px' : 'inherit'};
  
  &:hover {
    cursor: ${({ cursorType }) => cursorType ? cursorType : 'default'};
  }
`;

const backgroundColor = (props: PropsWithTheme<StyledTooltipProps>): string => {
  const { appColor, theme } = props;
  if (!appColor) {
    return theme.colors.secondary.background;
  }

  if (isBaseColor(appColor)) {
    return theme.baseColors[appColor];
  }

  if (isThemeColor(appColor)) {
    return theme.colors[appColor].background;
  }

  return appColor;
};

export const StyledTooltip = styled.div<StyledTooltipProps>`
  background-color: ${(props) => backgroundColor(props)};
  border-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  color: ${(props) => props.theme.colors.secondary.foreground};
  border: 2px ${({ theme }) => getRGBA(theme.colors.secondary.accent, .7)} solid;
  white-space: ${(props) => whiteSpace(props)};
  padding: 4px 8px;
  font-weight: ${({ theme, size }) => theme.sizes[size || 'md'].fontWeight};
  font-size: ${(props) => props.theme.sizes[props.size || 'md'].fontSize};
  opacity: 1;
`;