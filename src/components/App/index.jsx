import React, { memo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { GameContainer } from '../GameContainer';
import { Wrapper } from '../Wrapper';

const GlobalStyle = createGlobalStyle`
  html {
    margin: 0;
  }
  
  body {
    margin: 0;
  }
  
  * {
    margin: 0;
  }
`;

export const App = memo(() => (
  <Wrapper name="App">
    <GlobalStyle />
    <GameContainer />
  </Wrapper>
));
