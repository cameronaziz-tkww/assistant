import { getRGBA } from '@utils';
import styled from 'styled-components';

interface ContainerProps {
  halfSize?: boolean;
}

export const Container = styled.label<ContainerProps>`
  position: relative;
  display: block;
  min-width: 45px;
  height: 26px;
  white-space: nowrap;
`;

export const Image = styled.img`
  height: 18px;
  width: 18px;
  display: block;
`;

export const Input = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

interface OptionsProps {
  isDisabled?: boolean;
}

export const Options = styled.span<OptionsProps>`
  position: relative;
  height: 36px;
  align-items: center;
  display: flex;
  font-family: ${({ theme: { fonts } }) => fonts.inconsolata};

  &:hover {
    cursor:${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};
  }
`;

interface OptionProps {
  isChecked: boolean;
  isDisabled?: boolean;
}

export const LeftOption = styled.div<OptionProps>`
  color: ${({ theme: { colors } }) => colors.primary.foreground};
  margin: -10px 26px 0 12px;
  user-select: none;

  &:hover {
    cursor:${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};
  }
`;
export const RightOption = styled.div<OptionProps>`
  color: ${({ theme: { colors } }) => colors.primary.foreground};
  margin: -10px 12px 0 26px;
  user-select: none;

  &:hover {
    cursor:${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};
  }
`;

interface SliderProps {
  isChecked: boolean;
  isFocused: boolean;
  leftOptionWidth: number;
  rightOptionWidth: number;
  isBackgroundReverse?: boolean;
  isDisabled?: boolean;
}

export const Slider = styled.span<SliderProps>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ isBackgroundReverse, theme: { colors: { primary, tertiary } } }) => {
    return isBackgroundReverse ? tertiary.background : getRGBA(primary.background, 0.6);
  }};
  border-style: solid;
  border-width: 1px;
  border-color: ${({ theme: { colors: { primary: { 'accent-rgb': { r, g, b } } } } }) => `rgba(${r}, ${g}, ${b}, 0.4)`};
  box-shadow: ${({ theme: { colors: { primary: { 'accent-rgb': { r, g, b } } } } }) => {
    const lead = `rgba(${r}, ${g}, ${b},`;
    const tail = ')';
    return `inset 0 0 2px ${lead}0.3${tail}, inset 0 0 4px ${lead}0.1${tail}`;
  }};
  transition: .4s;
  border-radius: 26px;


  &:hover {
    cursor:${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};
  }


  &::before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: calc(16px + ${({ leftOptionWidth }) => leftOptionWidth}px);
    bottom: 3px;
    background-color: ${({ isDisabled, theme: { baseColors } }) => isDisabled ? getRGBA(baseColors.white, 0.4) : baseColors.white};
    transition: .4s;
    border-radius: 50%;
    transform: ${({ isChecked }) => isChecked ? 'translateX(26px)' : 'inherit'};

    &:hover {
      cursor:${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};
    }
  }
`;