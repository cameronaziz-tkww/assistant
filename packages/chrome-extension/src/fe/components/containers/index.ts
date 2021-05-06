import styled from  'styled-components';

export const DataContainer = styled.div`
  max-height: 200px;
  overflow-y: scroll;
  min-height: 50px;
  padding: 10px;
  border-radius: ${({ theme }) => theme.sizes.md.borderRadius};
  box-shadow: inset 0 0 4px rgba(${({ theme: { colors: { primary: { 'accent-rgb': accent }}}}) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.3);
  border: 1px rgba(${({ theme: { colors: { primary: { 'accent-rgb': accent }}}}) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.6) solid;
  background-color: ${(props) => props.theme.colors.primary.background};
`;

export const Flexer = styled.div`
  flex: 1;
`;
