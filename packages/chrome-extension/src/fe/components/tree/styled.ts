import { getThemeColor } from '@utils';
import { BiCaretDown, BiCaretRight } from 'react-icons/bi';
import { IoMdHelpCircle } from 'react-icons/io';
import styled from 'styled-components';

export const TreeContainer = styled.ul`
  list-style-type: none;
  margin: 0;
  overflow-y: hidden;
`;

export const Wrapper = styled.div`
  overflow: hidden;
`;

interface ChildWrapperProps {
  isEven: boolean;
  noBorder?: boolean;
}

interface ItemChildrenProps {
  hasPadding: boolean;
}

export const ItemChildren = styled.div<ItemChildrenProps>`
  padding: ${(props) => props.hasPadding ? props.theme.sizes.lg.padding : '0'} 0;
`;

export const TreeWrapper = styled.div<ChildWrapperProps>`
  overflow: scroll;
  max-height: 100px;
  background-color: ${(props) => props.theme.colors[props.isEven ? 'tertiary' : 'primary'].background};
`;

export const ChildTitle = styled.div`
  font-size: ${(props) => props.theme.sizes.md.fontSize};
  color: ${(props) => props.theme.colors.tertiary.foreground};
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  padding-left: 4px;
`;

export const LeftMenuTitle = styled(ChildTitle)`
  padding-left: 0;
`;

interface TreeWrapperContainer {
  hasLeftMenu?: boolean;
}

export const TreeWrapperContainer = styled.div<TreeWrapperContainer>`
  flex: 1;
  /* overflow-y: hidden; */
  margin: 0 0 0 ${(props) => props.hasLeftMenu ? '8px' : '0'};
`;

export const LeftMenuContainer = styled.div`
  margin: 0 8px 0 0;
`;

export const InfoIcon = styled(IoMdHelpCircle)`
  margin-left: ${({ theme }) => theme.sizes.md.marginX};

  &:hover {
    cursor: help;
  }
`;

export const LeftMenuItems = styled.div`
  padding: 0 2px;
`;

export const LeftMenuItem = styled.div`
  display: flex;
`;

export const ChildWrapper = styled.div<ChildWrapperProps>`
  display: flex;
  padding: 8px ${(props) => props.noBorder ? '0' : '8px'};
  /* overflow-y: hidden; */
  background-color: ${(props) => props.theme.colors[props.isEven ? 'tertiary' : 'primary'].background};
  box-shadow: ${(props) => {
    const { noBorder, theme: { colors: { tertiary, primary } } } = props;
    if (noBorder) {
      return 'inherit';
    }
    const accent = props.isEven ? tertiary['accent-rgb'] : primary['accent-rgb'];
    return `inset 0 0 8px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.3)`;
  }};
  border: ${(props) => {
    const { noBorder, theme: { colors: { tertiary, primary } } } = props;
    if (noBorder) {
      return 'inherit';
    }
    const accent = props.isEven ? tertiary['accent-rgb'] : primary['accent-rgb'];
    return `1px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.9) solid`;
  }};
`;

// export const Subtext = styled(Pill)`
//   margin-left: 8px;
//   text-transform: capitalize;
// `;

export const CaretRight = styled(BiCaretRight)`
  padding-top: 2px;
  display: block;
  height: 100%;

  &:hover {
    cursor: pointer;
  }
`;

export const CaretDown = styled(BiCaretDown)`
  padding-top: 2px;
  display: block;
  height: 100%;

  &:hover {
    cursor: pointer;
  }
`;

export const CaretHidden = styled(CaretRight)`
  visibility: hidden;

  &:hover {
    cursor: default;
  }
`;

export const Break = styled.div`
  height: 4px;
  margin-top: 4px;
  border-top: 1px ${getThemeColor('tertiary', 'background')} solid;
`;

interface ItemProps {
  isClickable: boolean;
}

export const Item = styled.div<ItemProps>`
  display: flex;
  position: relative;
  width: min-content;
  align-items: center;
  white-space: nowrap;

  &:hover {
    cursor: ${(props) => props.isClickable ? 'pointer' : 'inherit'};
  }
`;

interface ItemContainerProps {
  level: number;
  italics?: boolean;
}

export const ItemContainer = styled.li<ItemContainerProps>`
  margin-left: ${(props) => props.level * 8}px;
  font-style: ${(props) => props.italics ? 'italic' : 'inherit'};
`;

export const BlankContainer = styled.div<ItemContainerProps>`
  margin-left: ${(props) => props.level * 8}px;
  font-style: ${(props) => props.italics ? 'italic' : 'inherit'};
`;