import styled from 'styled-components';

export const Container = styled.div`
  width: calc(100% - 8px);
  height: 8px;
  background: #ccc;
  margin: 0 4px;
  border-radius: 4px;
`;

interface BarProps {
  percent: number;
}

export const Bar = styled.div<BarProps>`
  height: 8px;
  background: #4caf50;
  border-radius: 4px;
  width: ${(props) => props.percent}%;
`;
