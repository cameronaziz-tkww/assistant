import { BsCircleHalf } from 'react-icons/bs';
import styled from 'styled-components';

interface IconContainerProps {
  appColor: App.Theme.BaseColor;
  isFake?: boolean;
  isLink?: boolean;
}

export const HalfCircle = styled(BsCircleHalf)`
  transform: rotate(90deg);
`;

export const Avatar = styled.img`
  width: 16px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.sizes.md.marginX};
`;

export const ApprovalTooltip = styled.div`
  display: flex;
  align-items: center;
`;

export const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  opacity: ${({ isFake }) => isFake ? 0 : 1};

  & svg {
    color: ${(props) => props.theme.baseColors[props.appColor]};
  }

  & path {
    stroke: ${(props) => props.theme.baseColors[props.appColor]};
  }

  &:hover {
    cursor: ${({ isLink }) => isLink ? 'pointer' : 'default'};
  }
`;

interface StateContainerProps {
  isRed?: boolean;
}

export const StateContainer = styled.div<StateContainerProps>`
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin: 0 ${({ theme }) => theme.sizes.md.marginX};
  padding: ${({ theme }) => theme.sizes.md.padding};
  background-color: ${({ theme, isRed }) => {
    const base = isRed ? theme.baseColors['red-rgb'] : theme.baseColors['white-rgb'];
    const { r, g, b } = base;
    return `rgba(${r}, ${g}, ${b}, ${isRed ? 0.7 : 0.3})`;
  }};
`;

export const StateLabel = styled.div`
  margin-right: ${({ theme }) => theme.sizes.md.marginX};
`;

export const TooltipHeader = styled.div`
  font-size: ${({ theme: { sizes: { md } } }) => md.fontSize};
  font-weight: 600;
`;

export const Container = styled.div`
  display: flex;
  align-items: center;

  & :not(:first-child) {
    margin-left: 2px;
  }

  & :not(:last-child) {
    margin-right: 2px;
  }
`;

export const Ready = styled.div`
  margin-left: 4px;
`;

export const ReadyContainer = styled.div`
  background-color: ${(props) => props.theme.baseColors.green};
  border-radius: 3px;
  padding: 2px 4px;
  color: ${(props) => props.theme.baseColors.black};
  display: flex;
  align-items: center;
`;
