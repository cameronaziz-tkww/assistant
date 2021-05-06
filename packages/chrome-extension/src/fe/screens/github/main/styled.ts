import styled from 'styled-components';

export const LoadingMessage = styled.div`
  margin-left: 0.3rem;
`;

export const Title = styled.div`
  font-size: ${({ theme }) => theme.sizes.md.fontSize};
  padding: ${({ theme }) => theme.sizes.lg.padding};
  background-color: ${({ theme }) => theme.colors.secondary.background};
  color: ${({ theme }) => theme.colors.secondary.foreground};
  border-top-left-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  border-top-right-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
`;

export const RepoListContainer = styled.div`
  flex: 1;
  margin: 10px;
  border-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  background: ${({ theme }) => theme.colors.primary.background};;
  border: 1px solid #898C9F;
`;

export const Repos = styled.div`
  padding: ${({ theme }) => theme.sizes.xl.padding};
`;

interface CheckboxLabelProps {
  isSelected: boolean;
}

export const Checkbox = styled.input`
  visibility: hidden;
`;

export const CheckboxLabel = styled.label<CheckboxLabelProps>`
  &::before {
    border-radius: 2px;
    border: 2px solid #3C3F52;
    content: "${(props) => props.isSelected ? '\u2713' : ''}";
    display: inline-block;
    font: 8px / 1em sans-serif;
    height: 12px;
    margin: 0 .3rem 0 -0.5rem;
    padding: 0;
    vertical-align: text-bottom;
    width: 12px;
    background-color: #8E909C;
  }
`;

export const Label = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  min-width: 0px;
  &:hover {
    cursor: pointer;
  }
`;

export const RepoContainer = styled.div`
  display: flex;

  &:hover {
    cursor: pointer;
  }
`;