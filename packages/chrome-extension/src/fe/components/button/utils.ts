import { getRGBA } from '@utils';
import type { PropsWithTheme } from 'styled-components';
import type { ContainerProps } from './styled';

export const getButtonFontSize = (size?: App.Theme.Size): string => {
  switch (size) {
    case 'lg': return '150%';
    case 'md': return '100%';
    case 'sm': return '65%';
    default: return 'inherit';
  }
};

const getPaddingSize = (props: ContainerProps) => {
  const sizes = {
    lg: [12, 18],
    md: [6, 12],
    sm: [4, 8],
  };

  return sizes[props.size || 'md'];
};

export const getPadding = (props: ContainerProps): string => {
  const size = getPaddingSize(props);

  if (props.clearBackground) {
    return `${size[0] / 2}px ${size[1] / 2}px`;
  }

  return `${size[0]}px ${size[1]}px`;
};

export const getBackgroundColor = (props: PropsWithTheme<ContainerProps>): string => {
  const { theme: { colors }, isActive, clearBackground, isDisabled } = props;
  if (isDisabled) {
    return getRGBA(colors.quaternary['background-rgb'], 0.5);
  }

  if (isActive) {
    return colors.quaternary.background;
  }

  if (clearBackground) {
    return 'inherit';
  }

  return colors.secondary.background;
};

export const getHoverBackgroundColor = (props: PropsWithTheme<ContainerProps>): string => {
  const { theme: { colors }, clearBackground, isDisabled } = props;
  if (isDisabled) {
    return getRGBA(colors.quaternary['background-rgb'], 0.5);
  }

  if (clearBackground) {
    return colors.quaternary.background;
  }

  return colors.quaternary.background;
};

export const getColor = (props: PropsWithTheme<ContainerProps>): string => {
  if (props.isActive) {
    return props.theme.colors.quaternary.foreground;
  }

  if (props.clearBackground) {
    return props.theme.colors.tertiary.foreground;
  }

  return props.theme.colors.secondary.foreground;
};

export const getBorderRadius = (props: PropsWithTheme<ContainerProps>): string => {
  if (props.round) {
    return '50%';
  }

  return props.theme.sizes[props.size || 'lg'].borderRadius;
};

export const getBorder = (props: PropsWithTheme<ContainerProps>): string => {
  if (props.round) {
    return 'inherit';
  }

  return `1px ${props.theme.colors.tertiary.accent} solid`;
};