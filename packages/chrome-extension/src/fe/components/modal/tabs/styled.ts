import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  grid-area: tabs;
  padding-top: 20%;
`;

interface TabProps {
  isSelected: boolean;
}

export const Tab = styled.div<TabProps>`
  position: relative;
  border-right-width: 0;
  border-color: ${({ theme }) => theme.colors.primary.accent};
  border-style: solid;
  right: -4px;
  box-shadow: inset 0 0 4px ${({ theme }) => theme.colors.secondary.accent};
  border-top-left-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  border-bottom-left-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  padding: ${({ theme }) => theme.sizes.lg.padding};
  font-size: ${({ theme }) => theme.sizes.lg.fontSize};
  margin: ${({ theme }) => theme.sizes.xxl.marginY} 0 ${({ theme }) => theme.sizes.xxl.marginY} ${({ theme }) => theme.sizes.xxl.marginX};
  color: ${({ theme }) => theme.colors.secondary.foreground};
  background-color: ${({ theme, isSelected }) => isSelected ? theme.colors.quaternary.background : theme.colors.secondary.background};

  &:hover {
    cursor: pointer;
  }
`;
