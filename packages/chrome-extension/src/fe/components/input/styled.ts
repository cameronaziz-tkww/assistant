import { getRGBA } from '@utils';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import styled from 'styled-components';
import { containerPosition } from './utilities';

interface ContainerProps {
  containerPosition?: App.Position;
  inline?: boolean;
}

export const Container = styled.div<ContainerProps>`
  margin: 8px 0;
  position: relative;
  display: ${({ inline }) => inline ? 'inline-block' : 'flex'};
  justify-content: ${(props) => containerPosition(props.containerPosition)};
  align-items: center;
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

interface LabelProps {
  inlineLabel?: boolean
}

export const Label = styled.label<LabelProps>`
  font-weight: 200;
  display: ${({ inlineLabel }) => inlineLabel ? 'inline' : 'block'};
  font-size: ${({ theme }) => theme.sizes.sm.fontSize};
`;

export const Input = styled.input<App.Input.StyledInputProps>`
  background-color: ${({ theme: { colors }, isDisabled, ifDisabledColorSteady }) => {
    if (ifDisabledColorSteady && isDisabled) {
      return 'transparent';
    }

    if (isDisabled) {
      return colors.tertiary.background;
    }
    return colors.primary.background;
  }};
  user-select: ${({ isDisabled }) => isDisabled ? 'none' : 'auto'};;
  border-radius: ${({ theme }) => theme.sizes.md.borderRadius};
  margin: 0 ${({ theme, noMargin }) => noMargin ? 0 : theme.sizes.md.marginX
  } ${({ theme, handleInvalid, noMargin }) => noMargin || !handleInvalid ? 0 : theme.sizes.lg.marginY
  } ${({ theme: { sizes: { md, sm } }, hasLabel, noMargin }) => {
    if (noMargin) {
      return 0;
    }
    if (hasLabel) {
      return sm.marginX;
    }
    return md.marginX;
  }};
  border: 1px ${({ theme, isInvalid, isDisabled, ifDisabledColorSteady }) => {
    if (isDisabled && ifDisabledColorSteady) {
      return getRGBA(theme.colors.primary.background, 0.8);
    }

    if (isInvalid) {
      return getRGBA(theme.baseColors['red'], 0.8);
    }

    return getRGBA(theme.baseColors['grey-light'], 0.4);
  }} solid;
  color: ${({ theme }) => theme.colors.primary.foreground};
  padding: ${({ theme }) => theme.sizes.md.padding};
  width: ${({ afterNodeWidth, narrow, maxSize }) => {
    if (narrow) {
      if (typeof narrow === 'number') {
        return `${narrow + 12}px`;
      }

      return '100px';
    }

    if (typeof maxSize !== 'undefined') {
      return 'auto';
    }

    if (afterNodeWidth) {
      return `calc(100% - ${afterNodeWidth}px)`;
    }

    return '100%';

  }};
  line-height: ${({ isLarge, theme }) => isLarge ? theme.sizes.xxl.fontSize : 'normal'};
  font-size: ${({ isLarge, theme }) => isLarge ? theme.sizes.xxl.fontSize : 'medium'};
`;

interface InvalidTextProps {
  noMargin?: boolean;
}
export const InvalidText = styled.div<InvalidTextProps>`
  position: absolute;
  white-space: nowrap;
  color: ${({ theme }) => theme.baseColors.red};
  font-size: ${({ theme }) => theme.sizes.xs.fontSize};
  top: 24px;
  left: ${({ noMargin }) => noMargin ? 0 : '8px'};
`;

interface AfterNodeProps {
  inputWidth: number;
  afterNodeWidth: number;
  hasMaxSize: boolean;
}

export const AfterNode = styled.span<AfterNodeProps>`
  position: absolute;
  left: ${({ hasMaxSize, inputWidth, afterNodeWidth }) => {
    if (hasMaxSize) {
      return `${inputWidth}px`;
    }
    return `${inputWidth - afterNodeWidth}px`;
  }};
`;

export const Clear = styled(IoIosCloseCircleOutline)`
  position: absolute;
  right: 4px;

  &:hover {
    cursor: pointer;
  }

  & > path {
    stroke: #ffffff;
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

export const SearchLabel = styled.div`
`;

export const Wrapper = styled.div`
  display: flex;
`;
