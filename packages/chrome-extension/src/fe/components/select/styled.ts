import styled, { PropsWithTheme } from 'styled-components';

export const SelectWrapper = styled.div`
  width: 100px;
  position: relative;
`;

export const FloatingContainer = styled.div`
  position: absolute;
`;

interface SelectContainerProps {
  inlineLabel?: boolean;
}

export const SelectContainer = styled.div<SelectContainerProps>`
  display: ${({ inlineLabel }) => inlineLabel ? 'inline-block' : 'block'};
`;

export const FloatingItems = styled.div`
  position: relative;
  top: 4px;
  left: -4px;
  background-color: ${(props) => props.theme.colors.primary.background};
`;

export const FloatingItemsWithCaret = styled(FloatingItems)`
  top: 8px;

  &::after {
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    top: -6px;
    left: 8px;
    content: "";
    width: 0;
    height: 0;
    position: absolute;
    z-index: 999;
    border-bottom-color: ${(props) => props.theme.colors.primary.accent};
    border-bottom-style: solid;
    border-bottom-width: 6px;
  }
`;

export const FloatingTitle = styled.div<SelectComponentProps>`
  background-color: ${(props) => props.theme.colors.primary.accent};
  color: ${(props) => props.theme.colors.tertiary.background};
  font-weight: 800;
  font-size: ${(props) => props.theme.sizes.md.fontSize};
  padding: ${(props) => props.theme.sizes.md.padding};
  border: ${(props) => getBorder(props)};
`;

export const FloatingFooter = styled.div<SelectComponentProps>`
  background-color: ${(props) => props.theme.colors.primary.background};
  color: ${(props) => props.theme.colors.primary.foreground};
  padding: ${({ theme: { sizes } }) => `${sizes.sm.padding} ${sizes.sm.padding} ${sizes.xs.padding}`};
  border: ${(props) => getBorder(props)};
`;

interface SelectComponentProps {
  isActive?: boolean;
}

export const Label = styled.label`
  font-weight: 200;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.sizes.sm.fontSize};
`;

export const SelectComponent = styled.div<SelectComponentProps>`
  background-color: ${(props) => props.theme.colors.primary.background};
  border: 1px ${(props) => props.theme.colors.primary.accent} solid;
  border-bottom: ${(props) => props.isActive ? 'none' : `1px ${props.theme.colors.primary.accent} solid`};
  color: ${(props) => props.theme.colors.primary.foreground};
  padding: 4px 8px;
  position: relative;
  z-index: ${(props) => props.isActive ? '99' : 'inherit'};

  &:hover {
    cursor: pointer;
  }

  &::after {
    position: absolute;
    content: "";
    top: ${(props) => props.isActive ? '4px' : '9px'};
    right: 10px;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-color: ${(props) => props.isActive ? `transparent transparent ${props.theme.colors.primary.accent} transparent` : `${props.theme.colors.primary.accent} transparent transparent transparent`};
  }
`;

interface ItemsProps {
  isActive?: boolean;
  isAbsolute: boolean;
  hasTitle: boolean;
}

const getBorder = <T extends SelectComponentProps>(props: PropsWithTheme<T>) => {
  if (!props.isActive) {
    return 'none';
  }
  const { r, g, b } = props.theme.colors.primary['accent-rgb'];

  return `1px rgba(${r}, ${g}, ${b}, 0.5) solid`;
};

const getBorderTop = (props: PropsWithTheme<ItemsProps>) => {
  if (props.isAbsolute || !props.isActive || props.hasTitle) {
    return 'none';
  }
  const { r, g, b } = props.theme.colors.primary['accent-rgb'];

  return `1px rgba(${r}, ${g}, ${b}, 0.5) solid`;
};

export const Items = styled.div<ItemsProps>`
  position: ${(props) => props.isAbsolute ? 'absolute' : 'inherit'};
  background-color: ${(props) => props.theme.colors.primary.background};
  color: ${(props) => props.theme.colors.primary.foreground};
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  border: ${(props) => getBorder(props)};
  border-top: ${(props) => getBorderTop(props)};
`;

interface ItemProps {
  isSelected: boolean;
}

export const Item = styled.div<ItemProps>`
  color: #ffffff;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
  user-select: none;
  background-color: ${(props) => props.isSelected ? 'rgba(255, 255, 255, 0.1)' : 'inherit'};

  &:hover {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;
