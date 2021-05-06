import styled from 'styled-components';

interface RowProps {
  hasLeft: boolean;
  hasRight: boolean;
  columns: 1 | 2 | 3;
}

export const Row = styled.div<RowProps>`
  overflow-y: hidden;
  display: grid;
  grid-area: row;
  height: 100%;
  grid-template-columns: ${({ hasLeft }) => hasLeft ? '1fr 1fr' : '0px 0px'} 50px 50px ${({ hasRight }) => hasRight ? '1fr 1fr' : '0px 0px'};
  grid-template-rows: auto;
  grid-template-areas: "${({ columns }) => {
    switch (columns) {
      case 1: return 'first first first first first';
      case 2: return 'first first first second second second';
      case 3: return 'first first second second third third';
    }
  }}";
`;

export const Console = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  grid-template-areas:
  "row"
  "footer";
`;

export const HiddenContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
`;

export const Data = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ContainerProps {
  leftMargin?: boolean;
  rightMargin?: boolean;
  column: App.UnitColumn;
  rotated?: boolean;
}

export const Container = styled.div<ContainerProps>`
  overflow-y: hidden;
  position: relative;
  padding: 0 ${({ theme }) => theme.sizes.lg.marginX};
  display: flex;
  flex-direction: ${({ rotated }) => rotated ? 'row' : 'column'};
  margin-bottom: 20px;
  transition: 1s;
  margin-top: 10px;
  grid-area: ${({ column }) => column};
`;

interface ContentValueProps {
  hasData: boolean;
}

export const ContentValue = styled.div<ContentValueProps>`
  overflow-y: hidden;
  will-change: max-height;
  max-height: ${({ hasData, theme }) => hasData ? `${theme.windowHeight}px` : 0};
  transition: max-height 1s;
`;

interface ContentContainerProps {
  center?: boolean;
  hideProgress?: boolean;
}

export const ContentContainer = styled.div<ContentContainerProps>`
  margin-top: ${(props) => props.hideProgress ? '8px' : '0'};
  align-self: ${(props) => props.center ? 'center' : 'inherit'};
  display: ${(props) => props.center ? 'flex' : 'inherit'};
  justify-content: ${(props) => props.center ? 'center' : 'inherit'};
  flex-direction: ${(props) => props.center ? 'column' : 'inherit'};
  overflow-y: scroll;
  height: 100%;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;