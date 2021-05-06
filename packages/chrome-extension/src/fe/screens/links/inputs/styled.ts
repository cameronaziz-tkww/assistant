import styled from 'styled-components';

export const TooltipPart = styled.span`
  color: ${({ theme }) => theme.baseColors.red};
  font-family: ${({ theme }) => theme.fonts.inconsolata};
  text-transform: uppercase;
  font-weight: 800;
  font-size: ${({ theme }) => theme.sizes.lg.fontSize};
`;

export const TooltipNotPart = styled.span`
  color: ${({ theme }) => theme.baseColors.black};
  font-size: ${({ theme }) => theme.sizes.md.fontSize};
`;