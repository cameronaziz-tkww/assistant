import { getRGBA } from '@utils';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import styled, { PropsWithTheme } from 'styled-components';

export interface ContainerProps {
  isLight?: boolean;
  minContent?: boolean;
  background?: App.Theme.BaseColor;
  capitalize?: boolean;
  uppercase?: boolean;
  noCursor?: boolean;
  nowrap?: boolean;
  foreground?: App.Theme.BaseColor;
  fontType?: App.Theme.Font;
  overrideForeground?: string;
  overrideBackground?: string;
  size?: App.Theme.Size;
  themeColor?: App.Theme.ThemeColor;
  extraSmallPadding?: boolean;
  opacity?: number;
}

const handleRGBA = (color: string, isLight?: boolean, opacity?: number): string => {
  if (!isLight) {
    return getRGBA(color, opacity);
  }
  return getRGBA(color, opacity || .8);
};

const backgroundColor = (props: PropsWithTheme<ContainerProps>): string => {
  const { isLight, overrideBackground, background, opacity, theme, themeColor } = props;
  if (overrideBackground) {
    return handleRGBA(overrideBackground, isLight, opacity);
  }
  if (background) {
    return handleRGBA(theme.baseColors[background], isLight, opacity);
  }

  if (typeof themeColor === 'string') {
    return handleRGBA(theme.colors[themeColor].background, isLight, opacity);
  }

  if (typeof themeColor === 'undefined') {
    if (isLight) {
      return getRGBA(theme.baseColors['grey-dark'], opacity || 0.7);
    }
    return getRGBA(theme.baseColors['grey-light'], opacity || 0.7);
  }

  return handleRGBA(theme.colors[themeColor], isLight, opacity);
};

export const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  margin: ${({ theme: { sizes }, size }) => sizes[size || 'md'].margin};
  font-family: ${(props) => props.theme.fonts.inconsolata};
  text-transform: ${(props) => {
    if (props.uppercase) {
      return 'uppercase';
    }

    if (props.capitalize) {
      return 'capitalize';
    }

    return 'inherit';
  }};
  white-space: ${({ nowrap }) => nowrap ? 'nowrap' : 'normal'};
  width: ${({ minContent }) => minContent ? 'min-content' : 'auto'};
  word-spacing: ${({ minContent }) => minContent ? 'nowrap' : 'normal'};
  font-size: ${(props) => props.theme.sizes[props.size || 'md'].fontSize};
  line-height: ${(props) => props.theme.sizes[props.size || 'md'].fontSize};
  padding: ${({ theme: { sizes }, size, extraSmallPadding }) => {
    if (extraSmallPadding) {
      return `${sizes.xs.paddingY} ${sizes.md.paddingX}`;
    }
    return sizes[size || 'md'].padding;
  }};
  background-color: ${(props) => backgroundColor(props)};
  color: ${(props) => props.overrideForeground || (props.foreground ? props.theme.baseColors[props.foreground] : props.theme.colors[props.themeColor || 'secondary'].foreground)};
  border-radius: ${({ theme, size }) => theme.sizes[size || 'md'].borderRadius};
  user-select: none;

  &:hover {
    cursor: ${({ noCursor, onClick }) => !noCursor && !!onClick ? 'pointer' : 'default'};
  }
`;

export const Close = styled(IoIosCloseCircleOutline)`
  &:hover {
    cursor: pointer;
  }
`;