import { getRGBA } from '@utils';
import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: scroll;


  &::-webkit-scrollbar {
    display: none;
  }
`;

interface ButtonBaseProps {
  isDragging: boolean;
}

export const ButtonBase = styled.div<ButtonBaseProps>`
  margin: 12px 0;
  width: 48px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  opacity: ${({ isDragging }) => isDragging ? 0 : 1};
  background-color: ${(props) => props.theme.colors.primary.background};
  padding: 14px 0;;
  border-radius: 50%;

  box-shadow: 0 1px 2px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4);
  transition: transform 600ms ease-in-out, box-shadow 600ms linear;


  &:hover {
    transition: transform 100ms ease-in-out, box-shadow 100ms linear;
    cursor: pointer;
    transform: scale(1.04);
    box-shadow: 0 2px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5), 0 4px 7px rgba(0,0,0,0.3);
  }

`;

export const ImageContainer = styled(ButtonBase)`
  font-size: 0;
`;

export const Hotkey = styled.div`
  position: absolute;
  border-radius: 50%;
  width: 14px;
  width: 14px;
  top: -2px;
  right: -2px;
  text-align: center;
  border: 1px ${({ theme }) => getRGBA(theme.baseColors['grey-dark-rgb'], .4)} solid;
  font-size: ${({ theme }) => theme.sizes.xs.fontSize};
  color: ${({ theme }) => theme.baseColors['grey-dark']};
  background-color: ${({ theme }) => theme.baseColors.white};
`;

export const LettersWrapper = styled.div`
  color: ${({ theme: { colors: { secondary: { background } } } }) => background};
  width: 30px;
  height: 30px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  display: flex;
  justify-content: center;

  &:hover {
    cursor: pointer;
  }
`;

interface LettersContainerProps {
  scale: number;
}

export const LettersContainer = styled.div<LettersContainerProps>`
  transform: scale(${({ scale }) => scale});
  display: inline-block;

  &:hover {
    cursor: pointer;
  }
`;

export const Image = styled.img`
  height: 30px;
  width: 30px;
  display: block;

  &:hover {
    cursor: pointer;
  }
`;

