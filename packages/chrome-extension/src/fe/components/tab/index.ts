import styled from 'styled-components';

interface TabProps {
  allRoundCorners?: boolean;
}

export const Tab = styled.div<TabProps>`
  background-color: ${(props) => props.theme.colors.secondary.background};
  padding: 4px 6px;
  margin: 0 4px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border-top-left-radius: ${(props) => props.allRoundCorners ? '6px' : 'inherit'};
  border-top-right-radius: ${(props) => props.allRoundCorners ? '6px' : 'inherit'};

  &:hover {
    cursor: pointer;
  }
`;

export const EmptyTab = styled(Tab)`
  opacity: 60%;
  cursor: default;
`;