import styled, { keyframes } from 'styled-components';
import { AiOutlineLoading } from 'react-icons/ai';
import { VscLoading } from 'react-icons/vsc';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Line = styled(AiOutlineLoading)<IconProps>`
  height: ${(props) => props.height ? props.height : 'auto'};
  width: ${(props) => props.width ? props.width : '100px'};
  animation: ${rotate} ${({ speed }) => speed || 2}s infinite linear;
`;

export const Balls = styled(VscLoading)<IconProps>`
  height: ${(props) => props.height ? props.height : 'auto'};
  width: ${(props) => props.width ? props.width : '100px'};
  animation: ${rotate} ${({ speed }) => speed || 2}s infinite linear;
`;

interface IconProps {
  height?: string;
  width?: string;
  speed?: number;
}

export const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: rotation 2s infinite linear;
`;
