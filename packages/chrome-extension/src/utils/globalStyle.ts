import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  div,
  p,
  img,
  h1, h2, h3, h4, h5, h6,
  input, button,
  ul, li {
    border: 0;
    margin: 0;
    padding: 0;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.colors.primary.background};
    color: ${(props) => props.theme.colors.primary.foreground};
    font-family: ${({ theme: { fonts }}) => fonts.manrope};
    font-weight: 400;
    height: 100vh;
    width: 100vw;
  }

  div:hover {
    cursor: default;
  }

  textarea:focus, input:focus, button:focus {
    outline: none;
  }
`;

export default GlobalStyle;
