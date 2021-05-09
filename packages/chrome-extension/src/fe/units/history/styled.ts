import Pill from '@components/pill';
import { getRGBA } from '@utils';
import { AiFillCloseCircle, AiFillDownCircle } from 'react-icons/ai';
import { BiHistory } from 'react-icons/bi';
import styled from 'styled-components';

interface FeedContainerProps {
  inline?: boolean;
  isHidden: boolean;
}

export const CloseButton = styled(AiFillDownCircle)`
  position: absolute;
  bottom: ${({ theme }) => theme.sizes.xxl.marginX};
  transform: scale(2);
  color: ${({ theme }) => theme.colors.tertiary.foreground};
  transition: 500ms;

  &:hover {
    cursor: pointer;
    transform: scale(2.1);
    transition: 100ms;
    color: ${({ theme }) => getRGBA(theme.colors.tertiary.foreground, 0.7)};
  }
`;

export const FeedContainer = styled.div<FeedContainerProps>`
  overflow-y: scroll;
  padding-top: ${({ isHidden }) => isHidden ? '24px' : '4px'};
  max-height: 30vh;
  width: calc(100vw - 50px);
  display: inline-block;
  &:hover {
    cursor: ${({ isHidden }) => isHidden ? 'pointer' : 'default'};
  }
`;

export const HistoryIcon = styled(BiHistory)`
  color: ${({ theme }) => theme.colors.tertiary.foreground};
`;

export const DismissIcon = styled(AiFillCloseCircle)`
`;

interface ContainerProps {
  isHidden: boolean;
  isTease: boolean;
}

interface SidebarContainerProps {
  isHidden: boolean;
}

export const SidebarContainer = styled.div<SidebarContainerProps>`
  height: 100%;
  visibility: ${({ isHidden }) => isHidden ? 'hidden' : 'visible'};
  position: relative;
  width: 50px;
  display: inline-flex;
  justify-content: center;
`;

export const Container = styled.div<ContainerProps>`
  max-height: ${({ isHidden, isTease }) => {
    if (isHidden && isTease) {
      return '20px';
    }

    if (!isHidden) {
      return '500px';
    }

    return '14px';
  }};
  position: relative;
  grid-area: footer;
  margin-top: ${({ isHidden }) => isHidden ? '4px' : 0};
  transition: max-height ${({ isHidden }) => isHidden ? '0.2' : '2'}s ease-out;
  box-shadow: 0px 0 10px rgba(0, 0, 0, 0.8);
  border-top: ${({ theme }) => theme.colors.secondary.accent};
  background-color: ${({ theme }) => theme.colors.tertiary.background};
  overflow: hidden;
  
  &:hover {
    cursor: ${({ isHidden, isTease }) => isHidden && isTease ? 'pointer' : 'default'};
  }
`;

export const DismissContainer = styled.div`
  margin-left: ${({ theme }) => theme.sizes.md.marginX};
  padding: ${({ theme }) => theme.sizes.sm.paddingX};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 500ms;
  transform: scale(0.8);
  
  &:hover {
    transform: scale(1);
    background-color:${({ theme }) => getRGBA(theme.baseColors['red'], 0.5)};
    cursor: pointer;
  }
`;

export const FeedItem = styled(Pill)`
  display: flex;
  font-size: 1vw;
  position: relative;
  align-items: center;
  overflow-x: scroll;
  white-space: nowrap;
  background-color: ${({ theme }) => getRGBA(theme.baseColors['grey-light'], 0.2)};
  color: ${({ theme }) => theme.colors.primary.foreground}
  `;
// color: ${({ theme }) => theme.baseColors.black};

export const FeedItemMessage = styled.div`
  white-space: nowrap;
  font-weight: ${({ theme }) => theme.sizes.lg.fontWeight};
`;