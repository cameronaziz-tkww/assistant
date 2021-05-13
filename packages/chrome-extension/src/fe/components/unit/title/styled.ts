import { getThemeColor } from '@utils';
import styled, { keyframes } from 'styled-components';
import { ButtonContainer } from '../../button';

export const rotate = keyframes`
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
`;
export const SubTitle = styled.div`
  color: #ff79c6;
  text-align: center;
`;

interface TitleTextProps {
  isDark?: boolean;
}

export const TitleText = styled.h2<TitleTextProps>`
  color: ${({ theme, isDark }) => isDark ? theme.colors.secondary.foreground : 'inherit'};
`;

export const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto;
  grid-template-areas:
    "left title right"
    "filters filters filters";
`;

export const FiltersContainer = styled.div`
  grid-area: filters;
`;

interface CenterContainerProps {
  hasRight: boolean;
  hasLeft: boolean;
}

interface TextProps {
  horizontal?: 'left' | 'right'
}

export const Text = styled.div<TextProps>`
  display: flex;
  align-items: center;
  font-size: ${(props) => props.theme.sizes.lg.fontSize};
  align-self: ${({ horizontal }) => {
    switch (horizontal) {
      case 'left': return 'start';
      default: return 'center';
    }
  }};
`;

export const Icon = styled.span`
  margin-right: 6px;
  font-size: 150%;
  display: flex;
  align-items: center;
`;

export const CenterContainer = styled.div<CenterContainerProps>`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
  grid-area: title;
`;

export const MenuBaseContainer = styled.div`
  align-self: flex-start;
  display: flex;
`;

interface SideNodeProps {
  align: 'left' | 'right';
}

export const SideNode = styled.div<SideNodeProps>`
  left: ${({ align, theme }) => align === 'left' ? theme.sizes.lg.marginX : 'auto'};
  right: ${({ align, theme }) => align === 'right' ? theme.sizes.lg.marginX : 'auto'};
  color: ${({ theme }) => theme.colors.secondary.foreground};
  background-color: ${({ theme }) => theme.colors.secondary.background};
  border-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  padding: ${({ theme }) => theme.sizes.md.padding};
  position: absolute;
`;

export const MenuLeftContainer = styled(MenuBaseContainer)`
  grid-area: left;
  justify-self: start;


  & > ${ButtonContainer} {
    margin-right: 2px;
  }
`;

export const MenuRightContainer = styled(MenuBaseContainer)`
  grid-area: right;
  justify-self: end;

  & > ${ButtonContainer} {
    margin-left: 2px;
  }
`;
export const MenuLabel = styled.div`
  background-color: ${getThemeColor('secondary').background};
  color: ${getThemeColor('secondary').foreground};
  position: absolute;
`;