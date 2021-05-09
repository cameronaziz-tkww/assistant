import { AiFillCheckCircle, AiFillWarning } from 'react-icons/ai';
import { BsFillQuestionOctagonFill } from 'react-icons/bs';
import { GiNightSleep } from 'react-icons/gi';
import { RiErrorWarningFill } from 'react-icons/ri';
import styled, { PropsWithTheme } from 'styled-components';

export const StateValuesContainer = styled.div`
  display: flex;
`;

export const ErrorIcon = styled(RiErrorWarningFill)`
  color: ${(props) => props.theme.baseColors.red};

  &:hover {
    cursor: pointer;
  }
`;

export const StaleIcon = styled(GiNightSleep)`
  color: ${(props) => props.theme.baseColors['grey-light']};

  &:hover {
    cursor: pointer;
  }
`;

export const WarningIcon = styled(AiFillWarning)`
  color: ${(props) => props.theme.baseColors.yellow};

  &:hover {
    cursor: pointer;
  }
`;

export const SuccessIcon = styled(AiFillCheckCircle)`
  color: ${(props) => props.theme.baseColors.green};

  &:hover {
    cursor: pointer;
  }
`;

export const UnknownIcon = styled(BsFillQuestionOctagonFill)`
  color: ${(props) => props.theme.baseColors.white};

  &:hover {
    cursor: pointer;
  }
`;

interface ContainerProps {
  appColor: App.Theme.BaseColor;
}

export const Container = styled.div<ContainerProps>`
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin: 0 ${({ theme }) => theme.sizes.md.marginX};
  padding: ${({ theme }) => theme.sizes.md.padding};
  background-color: ${({ theme, appColor }) => {
    const { r, g, b } = theme.baseColors[`${appColor}-rgb`];
    return `rgba(${r}, ${g}, ${b}, .3)`;
  }};

  &:hover {
    cursor: pointer;
  }
`;

interface StateContainerProps {
  isRed?: boolean;
  isYellow?: boolean;
  isGreen?: boolean;
  isError?: boolean;
}

const baseColor = (props: PropsWithTheme<StateContainerProps>) => {
  if (props.isError) {
    return props.theme.baseColors['red-dark-rgb'];
  }

  if (props.isGreen) {
    return props.theme.baseColors['green-rgb'];
  }

  if (props.isRed) {
    return props.theme.baseColors['red-rgb'];
  }

  if (props.isYellow) {
    return props.theme.baseColors['yellow-rgb'];
  }

  return props.theme.baseColors['white-rgb'];
};

export const StateContainer = styled.div<StateContainerProps>`
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin: 0 ${({ theme }) => theme.sizes.md.marginX};
  padding: ${({ theme }) => theme.sizes.md.padding};
  background-color: ${(props) => {
    const base = baseColor(props);
    const { r, g, b } = base;
    return `rgba(${r}, ${g}, ${b}, .3)`;
  }};

  &:hover {
    cursor: pointer;
  }
`;

export const StatusName = styled.div`
  margin-left: 2px;

  &:hover {
    cursor: pointer;
  }
`;
