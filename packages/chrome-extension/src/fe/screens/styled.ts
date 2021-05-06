import styled from 'styled-components';

interface SectionContentProps {
  displayType?: 'flex' | 'grid';
  flexRow?: boolean;
}

export const SaveButtonContainer = styled.div`
  position: absolute;
  bottom: 5vh;
  right: 5vw;
`;

export const RepositoryListsWrapper = styled.div`
  display: flex;
`;

export const SectionContent = styled.div<SectionContentProps>`
  display: ${({ displayType }) => displayType || 'flex'};
  flex-direction: ${({ flexRow }) => flexRow ? 'row' : 'column'};
  grid-auto-rows: auto;
  position: relative;
  grid-template-columns: auto auto;
  grid-column-gap: 12px;
`;

interface SectionProps {
  flexRow?: boolean;
  justifyCenter?: boolean;
}

export const Section = styled.div<SectionProps>`
  margin-bottom: 10px;
  padding: 4px;
  justify-content: ${({ justifyCenter }) => justifyCenter ? 'center' : 'inherit'};
  display: flex;
  flex-direction: ${({ flexRow }) => flexRow ? 'row' : 'column'};
`;

export const SectionTitle = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  margin-left: -${({ theme }) => theme.sizes.md.marginX};
  font-size: ${({ theme }) => theme.sizes.lg.fontSize};
`;

export const SectionSubTitle = styled.div`
  flex: 1;
  margin: 6px 0 2px 4px;
  font-size: ${(props) => props.theme.sizes.md.fontSize};
`;

export const SectionSubSection = styled.div`
  flex: 1;
  position: relative;
  border-radius: ${({ theme }) => theme.sizes.sm.borderRadius};
  box-shadow: ${({ theme: { colors: { secondary: { 'accent-rgb': { r, g, b } } } } }) => {
    const lead = `rgba(${r}, ${g}, ${b},`;
    const tail = ')';
    return `0 0 2px ${lead}0.9${tail}, 0 0 4px ${lead}0.5${tail}, 0 0 8px ${lead}0.2${tail}`;
  }};
  border: 1px ${(props) => props.theme.colors.primary.background} solid;
  padding: ${({ theme }) => theme.sizes.md.padding};
`;

export const SectionSubContent = styled.div`
  flex: 1;
  margin-bottom: 2px;
  padding: 0 ${({ theme: { sizes: { lg } } }) => lg.paddingX};
`;

export const RightContainer = styled.div`
  position: sticky;
  float: right;
  bottom: ${({ theme }) => theme.sizes.md.marginY};;
`;