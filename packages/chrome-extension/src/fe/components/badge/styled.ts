import { getRGBA } from '@utils';
import styled from 'styled-components';

interface BadgeContainerProps {
  isWeak?: boolean;
}

export const BadgeContainer = styled.div<BadgeContainerProps>`
  font-size: ${({ theme }) => theme.sizes.sm.fontSize};
  position: absolute;
  background-color: ${({ theme, isWeak }) => isWeak ?
    theme.baseColors['red-light'] :
    theme.baseColors['white']
  };
  color: ${({ theme, isWeak }) => isWeak ?
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