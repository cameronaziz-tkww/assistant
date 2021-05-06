import styled from 'styled-components';

export const DataContainer = styled.div`
  max-height: 200px;
  overflow-y: scroll;
  min-height: 50px;
  padding: 10px;
  box-shadow: inset 0 0 4px rgba(${({ theme: { colors: { primary: { 'accent-rgb': accent } } } }) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.3);
  border: 1px rgba(${({ theme: { colors: { primary: { 'accent-rgb': accent } } } }) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.6) solid;
  background-color: ${(props) => props.theme.colors.primary.background};
`;

export const Options = styled.div`
  display: grid;
  position: relative;
  flex-direction: column;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  column-gap: ${({ theme }) => theme.sizes.md.marginX};;
  align-items: center;
`;

export const Option = styled.div`
  align-items: center;
  position: relative;
  align-items: center;
  display: flex;
  top: 0;
`;

export const OptionTitle = styled.label`
  font-weight: 200;
  font-size: ${({ theme }) => theme.sizes.sm.fontSize};
`;

export const OptionSwitch = styled.div`
  justify-self: left;
`;