import { getRGBA } from '@utils';
import { BsCircleFill } from 'react-icons/bs';
import styled from 'styled-components';

interface FilterContainerProps {
  color: App.Filter.Filter['color'];
  count: number;
}

interface BadgeContainerProps {
  isFiltered: boolean;
}

export const BadgeContainer = styled.div<BadgeContainerProps>`
  font-size: ${({ theme }) => theme.sizes.sm.fontSize};
  position: absolute;
  background-color: ${({ theme, isFiltered }) => isFiltered ?
    theme.baseColors['red-light'] :
    theme.baseColors['white']
  };
  color: ${({ theme, isFiltered }) => isFiltered ?
    theme.baseColors['white'] :
    theme.baseColors['grey-dark']
  };
  border-radius: 6px;
  padding: 1px ${({ theme }) => theme.sizes.sm.paddingX};
  line-height: ${({ theme }) => theme.sizes.xs.fontSize};
  top: -2px;
  right: -6px;
  border: 1px ${({ theme }) => getRGBA(theme.baseColors['grey-dark'], 0.2)} solid;

  &:hover {
    cursor: pointer;
  }
`;

export const FilterContainer = styled.div<FilterContainerProps>`
  border-radius: 50%;
  margin: 0 3px;
  font-size: 14px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  width: 30px;
  height: 30px;
  text-align: center;
  background-color: ${({ color, count }) => getRGBA(color, count > 0 ? 1 : 0.4)};
  border-style: solid;
  border-width: 1px;
  border-color: ${({ theme }) => getRGBA(theme.baseColors['grey-dark'], 0.4)};

  &:hover {
    cursor: pointer;
  }
`;

interface TextProps {
  scale: number;
}

export const Text = styled.div<TextProps>`
  transform: scale(${({ scale }) => scale});
  &:hover {
    cursor: pointer;
  }
`;

export const Cross = styled(BsCircleFill)`
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  opacity: 0.8;
  color: ${(props) => props.theme.baseColors.red};
`;

export const Checkmark = styled(BsCircleFill)`
  transform: scale(0.8);
  position:absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  opacity: 0.7;
  color: ${(props) => props.theme.baseColors.green};
`;

export const GroupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.colors.secondary.background};
  color: ${(props) => props.theme.colors.secondary.foreground};
  box-shadow: 0 0 2px ${(props) => props.theme.colors.secondary.accent};
  width: min-content;
  padding: 2px 4px;
  border-radius: 4px;
  margin: 2px 0;
`;

export const LabelWrapper = styled.div`
  margin-right: 4px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
export const Label = styled.div`

`;

interface ClearProps {
  isHidden: boolean;
}

export const Clear = styled.div<ClearProps>`
  opacity: ${({ isHidden }) => isHidden ? '0' : '1'};
  font-size: ${(props) => props.theme.sizes.sm.fontSize};

  &:hover {
    cursor: ${({ isHidden }) => isHidden ? 'inherit' : 'pointer'};
  }
`;

export const Wrapper = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 4px 0;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  & > :not(:last-child) {
    margin-right: 4px;
  }


  & > :not(:first-child) {
    margin-left: 4px;
  }
`;