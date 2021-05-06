import { ModalUI } from '@components/modal';
import Providers from '@context/providers';
import Units from '@units';
import { GlobalStyle, theme } from '@utils';
import React from 'react';
import { ThemeProvider } from 'styled-components';

const Application: React.FunctionComponent = () => {

  return (
    <ThemeProvider theme={{ ...theme, windowHeight: window.innerHeight }}>
      <Providers>
        <GlobalStyle />
        <Units />
        <ModalUI />
      </Providers>
    </ThemeProvider>
  );
};

export default Application;
