import styled from 'styled-components';

interface CheckmarkProps {
  isChecked?: boolean;
  isDisabled?: boolean;
}

interface LabelProps {
  isDisabled?: boolean;
  capitalize?: boolean;
}

interface ContainerProps {
  isChecked?: boolean;
  hasLabel: boolean;
  isHovered: boolean;
  isDisabled?: boolean;
}

export const Input = styled.input<LabelProps>`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;

  &:hover {
    cursor: ${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};;
  }
`;

// background-color: ${(props) => props.isChecked ? '#851100' : '#eee'};

export const Checkmark = styled.span<CheckmarkProps>`
  position: absolute;
  top: 1px;
  left: 0;
  height: 11px;
  width: 11px;
  box-shadow: inset 0 0 2px rgba(${({ theme: { colors: { secondary: { 'accent-rgb': accent } } } }) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.9);

  &::after {
    left: 1px;
    top: -2px;
    color: ${(props) => props.theme.colors.secondary.accent};
    position: absolute;
    transform: scale(0.8) rotate(10deg);
    content: "${'\u2713'}";
    display: ${(props) => props.isChecked ? 'inline' : 'none'};
  }
`;

export const Label = styled.div<LabelProps>`
  text-overflow: ellipsis;
  position: relative;
  top: -1px;
  text-transform:${({ capitalize }) => capitalize ? 'capitalize' : 'none'};
  opacity: ${({ isDisabled }) => isDisabled ? 0.8 : 1};

  &:hover {
    cursor: ${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};;
  }
`;

export const Container = styled.label<ContainerProps>`
  display: block;
  position: relative;
  width: min-content;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-left: 16px;
  user-select: none;
  opacity: ${({ isDisabled }) => isDisabled ? 0.8 : 1};

  &:hover {
    cursor: ${({ isDisabled }) => isDisabled ? 'default' : 'pointer'};;
  }

  & > ${Checkmark} {
    background-color: ${(props) => {
    const { isHovered, isChecked, theme: { colors, baseColors }, isDisabled } = props;
    const { secondary, quaternary } = colors;

    if (isHovered && !isDisabled) {
      return isChecked ? quaternary.background : secondary.background;
    }

    return isChecked ? secondary.background : baseColors['grey-light'];
  }};
  }
`;