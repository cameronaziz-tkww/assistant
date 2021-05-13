import { getRGBA } from '@utils';
import styled from 'styled-components';

interface FilterContainerProps {
  color: App.Filter.Filter<App.Filter.Item>['color'];
  count: number;
  state?: App.Filter.FilterState;
}

export const FilterContainer = styled.div<FilterContainerProps>`
  border-radius: 50%;
  margin: 0 4px;
  font-size: 14px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  width: 30px;
  height: 30px;
  text-align: center;
  background-color: ${({ color, count }) => getRGBA(color, count > 0 ? 1 : 0.4)};
  border: 1px ${({ theme }) => theme.baseColors['grey-dark']} solid;

  &:before {
    content: " ";
    position: absolute;
    border-radius: 50%;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-width: 3px;
    border-style: solid;
    border-color: ${({ theme, state }) => {
    switch (state) {
      case 'exclude': return theme.baseColors.red;
      case 'include': return theme.baseColors.green;
      default: return 'transparent';
    }
  }};
  }

  &:hover {
    cursor: pointer;
  }
`;

interface TextProps {
  scale: number;
}

export const Text = styled.div<TextProps>`
  transform: scale(${({ scale }) => scale});
  &:hover {
    cursor: pointer;
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
`;

interface GroupContainerProps {
  defaultMaxHeight: number;
  defaultMaxWidth: number;
  filterCount: number;
}

export const GroupContainer = styled.div<GroupContainerProps>`
  display: flex;
  justify-content: left;
  align-items: top;
  background-color: ${(props) => props.theme.colors.secondary.background};
  color: ${(props) => props.theme.colors.secondary.foreground};
  box-shadow: 0 0 2px ${(props) => props.theme.colors.secondary.accent};
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.sizes.lg.borderRadius};;
  margin: 2px 0;
  overflow: hidden;

  &.visible-enter {
    max-width: ${({ defaultMaxWidth }) => `${defaultMaxWidth + 4}px`};
    max-height: ${({ defaultMaxHeight }) => `${defaultMaxHeight + 2}px`};
  }

  &.visible-enter-active {
    max-height: 38px;
    max-width: ${({ defaultMaxWidth, filterCount }) => `${defaultMaxWidth + ((filterCount + 8) * 30) + 10}px`};
    transition: max-height 300ms, max-width 1200ms;
  }

  &.visible-exit {
    max-height: 38px;
    max-width: ${({ defaultMaxWidth, filterCount }) => `${defaultMaxWidth + ((filterCount + 8) * 30) + 10}px`};
  }

  &.visible-exit-active {
    max-height: ${({ defaultMaxHeight }) => `${defaultMaxHeight + 2}px`};
    max-width: ${({ defaultMaxWidth }) => `${defaultMaxWidth + 4}px`};
    transition: max-height 100ms 500ms, max-width 700ms;
  }
`;

interface LabelWrapperProps {
  isPointer: boolean;
}

export const LabelWrapper = styled.div<LabelWrapperProps>`
  margin-right: 4px;
  white-space: nowrap;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:hover {
    cursor: ${({ isPointer }) => isPointer ? 'pointer' : 'default'};
  }
`;

export const Label = styled.div`
  &:hover {
    cursor: inherit;
  }
`;

export const Close = styled.div`
  font-size: ${(props) => props.theme.sizes.xs.fontSize};
  color: ${({ theme }) => theme.baseColors.black};
  text-align: center;
  width: min-content;
  height: min-content;
  padding: 0 ${({ theme }) => theme.sizes.xs.paddingY};
  background-color: ${({ theme }) => theme.baseColors['grey-light']};
  border: 1px ${({ theme }) => getRGBA(theme.baseColors.grey, 0.3)} solid;
  border-radius: ${({ theme }) => theme.sizes.md.borderRadius};
  transition: all 400ms;
  
  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.baseColors['grey-dark']};
    background-color: ${({ theme }) => theme.baseColors.grey};
  }
`;

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

export const GroupWrapper = styled.div`
  position: relative;
`;

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 4px 0;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  & > :not(:last-child) {
    margin-right: 4px;
  }


  & > :not(:first-child) {
    margin-left: 4px;
  }
`;