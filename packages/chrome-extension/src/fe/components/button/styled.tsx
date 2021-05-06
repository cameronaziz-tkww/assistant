import React from 'react';
import styled from 'styled-components';
import * as LoadingStyled from '../loading/styled';
import * as utils from './utils';

interface LoadingProps {
  textWidth: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Loading = styled(({ textWidth, ...rest }) => <LoadingStyled.Balls {...rest} />) <LoadingProps>`
  width: 16px;
  margin: 0 ${({ textWidth }) => (textWidth - 28) / 2}px;  
`;

interface AbsolutePosition {
  top?: number;
  bottom?: number;
  right?: number;
  left?: number;
}

export interface ContainerProps {
  size?: App.Theme.Size;
  absolute?: AbsolutePosition;
  clearBackground?: boolean;
  themeColor?: App.Theme.ThemeColor;
  block?: boolean;
  round?: boolean;
  isActive?: boolean;
  noMargin?: boolean;
  isDisabled?: boolean;
}

interface ContainerOnlyProps {
  onlyIcon: boolean;
}

export const Container = styled.button<ContainerProps & ContainerOnlyProps>`
  align-items: center;
  align-self: center;
  position: ${({ absolute }) => typeof absolute === 'undefined' ? 'relative' : 'absolute'};
  right: ${({ absolute }) => absolute?.right ? `${absolute.right}px` : 'auto'};
  top: ${({ absolute }) => absolute?.top ? `${absolute.top}px` : 'auto'};
  left: ${({ absolute }) => absolute?.left ? `${absolute.left}px` : 'auto'};
  bottom: ${({ absolute }) => absolute?.bottom ? `${absolute.bottom}px` : 'auto'};
  font-family: ${({ theme: { fonts }, round }) => round ? fonts.inconsolata : 'inherit'};
  background-color: ${(props) => utils.getBackgroundColor(props)};
  border: ${(props) => utils.getBorder(props)};
  border-radius: ${(props) => utils.getBorderRadius(props)};
  color: ${(props) => utils.getColor(props)};
  display: ${({ block }) => block ? 'block' : 'inline-block'};
  text-align: center;
  margin: ${({ size, noMargin, theme: { sizes } }) => noMargin ? '0' : sizes[size || 'lg'].margin};
  font-weight: ${({ theme, size }) => theme.sizes[size || 'md'].fontWeight};
  font-size: ${(props) => props.theme.sizes[props.size || 'md'].fontSize};
  padding: ${({ size, onlyIcon, theme: { sizes } }) => {
    const paddingSize = sizes[size || 'md'];
    if (onlyIcon) {
      return `${paddingSize.paddingX} ${paddingSize.paddingX}`;
    }
    return paddingSize.padding;
  }};
  transition: 0s;
  white-space: nowrap;
  line-height: ${({ onlyIcon }) => onlyIcon ? '0' : 'inherit'};

  &:hover {
    background-color: ${(props) => utils.getHoverBackgroundColor(props)};
    box-shadow: 0 0 4px ${(props) => props.theme.colors.secondary.accent};
    color: ${(props) => props.theme.colors.secondary.foreground};
    cursor: ${({ isDisabled }) => isDisabled ? 'inherit' : 'pointer'};
    transition: 0.5s;
  }

  & > *:hover {
    cursor: ${({ isDisabled }) => isDisabled ? 'inherit' : 'pointer'};
  }

  &:disabled {
    background-color: inherit;
    cursor: default;
  }
`;

export const IconContainer = styled.div`
  position: relative;
`;
