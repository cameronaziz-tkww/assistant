import Button from '@components/button';
import { getRGBA } from '@utils';
import { GrClose } from 'react-icons/gr';
import styled from 'styled-components';

export const Container = styled.div`
  position: absolute;
  /* z-index: 999; */
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
  background-color: rgba(0,0,0,0.4);
`;

export const ContentContainer = styled.div`
  background-color: ${(props) => props.theme.colors.primary.background};
  margin: 10vh auto;
  padding: ${({ theme }) => theme.sizes.md.paddingY} 0 0 0;
  box-shadow: inset 0 0 8px rgba(${({ theme: { colors: { secondary: { 'accent-rgb': accent } } } }) => `${accent.r}, ${accent.g}, ${accent.b},`} 0.3);
  width: 60vw;
  border-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  height: 80vh;
  position: relative;
  border: 1px ${({ theme }) => getRGBA(theme.colors.primary.accent, 0.4)} solid;
  box-shadow: 0 0 6px ${({ theme }) => getRGBA(theme.colors.primary.accent, 0.4)};
`;

export const SelectionContentContainer = styled.div`
  overflow-y: hidden;
  display: grid;
  height: 100%;
  grid-template-columns: auto 1fr;
  grid-template-rows: 48px auto 48px;
  grid-template-areas:
    "title title"
    "tabs content"
    "footer content";
`;

export const Content = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-content: space-between;
`;

export const SelectionContent = styled.div`
  overflow-y: scroll;
  transform: none;
  position: relative;
  grid-area: content;
  height: 100%;
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  border-top-width: 1px;
  border-left-width: 1px;
  border-top-left-radius: ${({ theme }) => theme.sizes.lg.borderRadius};
  border-color: ${({ theme }) => getRGBA(theme.colors.primary.accent, 0.5)};
  border-style: solid;
  background-color: ${({ theme }) => theme.colors.tertiary.background};

  &::-webkit-scrollbar {
    display: none;
  }

  padding: 0 20px;
`;

export const CloseButton = styled(Button)`
  position: absolute;
  top: 8px;
  right: 12px;
`;

export const Close = styled(GrClose)`
  & > path {
    stroke: ${({ theme }) => theme.colors.secondary.foreground};
  }

  &:hover {
    cursor: pointer;
  }
`;

export const Hr = styled.hr`
  margin-bottom: 0px;
`;

export const Heading = styled.div`
  grid-area: title;
  display: flex;
  height: 100%;
  justify-content: flex-start;
  align-items: flex-end;
  font-family: ${({ theme }) => theme.fonts.nunito};
  font-size: ${({ theme }) => theme.sizes.xxl.fontSize};
  padding-left: ${({ theme }) => theme.sizes.md.paddingX};
  margin-bottom: ${({ theme }) => theme.sizes.md.marginY};
`;

export const Title = styled.h2`
  display: block;
  padding: 0 10px;
  font-size: ${(props) => props.theme.sizes.xl.fontSize};
  color: ${(props) => props.theme.colors.primary.foreground};
`;

export const FooterContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  grid-area: footer;
  box-shadow: 0px -4px 3px rgba(50, 50, 50, 0.75);
  background-color: ${({ theme }) => theme.colors.primary.background};
  border-left-width: 1px;
  border-color: ${({ theme }) => getRGBA(theme.colors.primary.accent, 0.5)};
  border-style: solid;
`;

export const Footer = styled.div`
  display: flex;
  justify-self: flex-end;
  justify-content: flex-end;
  padding: 20px 30px 10px 0;
`;