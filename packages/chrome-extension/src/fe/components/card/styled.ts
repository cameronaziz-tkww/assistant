import styled from 'styled-components';

export const CardTitle = styled.div`
  background-color: ${(props) => props.theme.colors.secondary.background};
  color: ${(props) => props.theme.colors.secondary.foreground};
  border-radius: 2px;
  padding: 2px;
  box-shadow: 0 0 2px ${(props) => props.theme.colors.secondary.accent};

  &:hover {
    cursor: ${(props) => props.onClick ? 'pointer' : 'inherit'};
  }
`;

export const CenterTitle = styled.div`
  flex: 1;
  text-align: left;
  font-size: ${(props) => props.theme.sizes.sm.fontSize};
  padding-left: ${({ theme }) => theme.sizes.xs.paddingX};;
  margin-top: -6px;
  align-self: center;
  justify-self: center;
  top: 2px;
  font-family: ${(props) => props.theme.fonts.heebo};
`;

export const CardEndTitle = styled.div`
  border-radius: 2px;
  padding: 2px;
  color: #000000;
`;

export const Heading = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 2px;
`;

export interface ContentProps {
  contentSize?: App.Theme.Size;
  contentDisplay?: App.UI.DisplayType;
  contentColumns?: number;
}

export const Content = styled.div<ContentProps>`
  margin: ${({ theme }) => theme.sizes.xl.margin};
  font-size: ${({ contentSize, theme: { sizes } }) => sizes[contentSize || 'lg'].fontSize};
  font-family: ${(props) => props.theme.fonts.manrope};
  font-weight: 600;
  display: ${({ contentDisplay }) => contentDisplay || 'inherit'};
  grid-template-columns: ${({ contentColumns }) => contentColumns ?
    Array.from({ length: contentColumns }).map(() => 'auto ') :
    'auto'
  };
`;

export const Footer = styled.div`
  display: flex;
  align-items: baseline;
  width: 100%;
  justify-content: space-between;
`;

export const Title = styled.div`
  padding: 2px 4px;
  font-size: ${(props) => props.theme.sizes.lg.fontSize};
`;

interface ContainerProps {
  isDisabled?: boolean;
}

export const Container = styled.div<ContainerProps>`
  border-radius: ${({ theme }) => theme.sizes.xxl.borderRadius};
  box-shadow: ${({ theme: { colors: { secondary: { 'accent-rgb': { r, g, b } } } } }) => {
    const lead = `rgba(${r}, ${g}, ${b},`;
    const tail = ')';
    return `0 0 2px ${lead}0.9${tail}, 0 0 4px ${lead}0.5${tail}, 0 0 8px ${lead}0.2${tail}`;
  }};
  border: 1px ${(props) => props.theme.colors.primary.background} solid;
  transition: height 0.5s ease-in-out;
  color: ${(props) => props.theme.colors.tertiary.foreground};
  background-color: ${({ theme, isDisabled }) => isDisabled ? theme.colors.primary.background : theme.colors.tertiary.background};
  margin: 10px 4px;
  padding: ${({ theme }) => theme.sizes.xl.padding};
  width: 100%;
`;

export const EndFooter = styled.div`
  justify-self: flex-end;
`;

export const EndFooterExpand = styled.div`
  font-size: ${(props) => props.theme.sizes.sm.fontSize};

  &:hover {
    cursor: pointer;
  }
`;