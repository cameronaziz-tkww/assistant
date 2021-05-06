import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
`;

interface LabelProps {
  bgColor: string;
  isLight: boolean;
}

export const Label = styled.div<LabelProps>`
  padding: 2px 4px;
  border-radius: 4px;
  font-size: ${(props) => props.theme.sizes.md.fontSize};
  background-color: ${(props) => props.bgColor};
  color: ${({ theme: { baseColors }, isLight }) => isLight ? baseColors.black : baseColors.white};
  margin-left: 4px;
  box-shadow: 0 0 1px ${({ theme: { baseColors }, isLight }) => isLight ? baseColors['grey-dark'] : baseColors['grey-light']} ;
`;